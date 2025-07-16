import { ChatCommands } from "@/constants/chat-commands";
import { NCC_USERS } from "@/constants/ncc-users";
import { QRCodeType } from "@/constants/qrcode-type";
import { getRandomColor } from "@/helpers/color";
import { CreatePlayerDto } from "@/models/players/create-player";
import { PlayerData } from "@/models/players/player-data";
import { NCCUser } from "@/types/ncc-user";
import dayjs from "dayjs";
import { StatusCodes } from "http-status-codes";
import { ChannelMessage, EMarkdownType, MezonClient, TokenSentEvent } from "mezon-sdk";
import { CommonMessagesService } from "../bot-messages/common-messages";
import { PlayersMessagesService } from "../bot-messages/players-messages";
import { PlayerService } from "../players/player-service";
class MezonBotService {

  private client: MezonClient;
  private _commonMessagesService: CommonMessagesService;
  private _playersMessagesService: PlayersMessagesService;
  private _playerService: PlayerService;

  constructor(
    CommonMessagesService: CommonMessagesService,
    PlayersMessagesService: PlayersMessagesService,
    PlayerService: PlayerService
  ) {
    this.client = new MezonClient(process.env.MEZON_BOT_TOKEN);
    this.client.login().then(() => {
      console.log("Mezon Bot is ready!");
    })
    this._playerService = PlayerService;
    this._commonMessagesService = CommonMessagesService;
    this._playersMessagesService = PlayersMessagesService;
    this._commonMessagesService.injectClient(this.client);
    this._playersMessagesService.injectClient(this.client);
    this.client.onChannelMessage(this.listenChanelMessages);
    this.client.onTokenSend(this.listTokenSendEvent);
  }

  private listenChanelMessages = (event: ChannelMessage) => {
    // Handle the channel message event here
    const commandMessage = event.content?.t
    if (!commandMessage || !commandMessage.startsWith("*")) {
      return;
    }
    switch (commandMessage) {
      case commandMessage.match(ChatCommands.PING)?.input:
        this._commonMessagesService.ping(event);
        break;

      case commandMessage.match(ChatCommands.HELP)?.input:
        this._commonMessagesService.help(event);
        break;

      case commandMessage.match(ChatCommands.REGISTER)?.input:
        this._playersMessagesService.register(event);
        break;

      case commandMessage.match(ChatCommands.PLAYERS)?.input:
        this._playersMessagesService.getPlayers(event);
        break;
      default:
        break;
    }
  }

  private listTokenSendEvent = async (event: TokenSentEvent) => {
    if (event.sender_id === event.receiver_id) {
      return;
    }

    if (event.note === QRCodeType.DIRECT) {
      await this.handleDirectRegister(event);
      return;
    }

    await this.handleChatRegister(event);
  }

  private async handleDirectRegister(event: TokenSentEvent): Promise<void> {
    try {
      if (event.amount < Number(process.env.REGISTER_FEE)) {
        await this.refundTokenAsync(
          event.receiver_id,
          event.sender_id,
          event.amount,
          "Số tiền gửi không đủ để đăng ký giải đấu"
        );
        return;
      }

      const directUser: NCCUser = NCC_USERS.find(user => user.id === event.sender_id);
      if (!directUser) {
        await this.refundTokenAsync(
          event.receiver_id,
          event.sender_id,
          event.amount,
          "Không tìm thấy người dùng trong hệ thống");
        return;
      }

      const registerData: CreatePlayerDto = {
        mezonId: event.sender_id,
        userName: directUser.username,
        displayName: directUser?.display_name || directUser.username,
        avatarUrl: directUser?.avatar_url,
      };

      const response = await this._playerService.directRegisterPlayer(registerData);
      if (response.statusCode !== StatusCodes.OK) {
        await this.refundTokenAsync(event.receiver_id, event.sender_id, event.amount, response.message);
        return;
      }

      const dmClan = await this.client.clans.fetch('0');
      const customer = await dmClan.users.fetch(event.sender_id);
      if (customer) {
        customer.sendDM({
          t: response?.message,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: response?.message?.length,
            },
          ],
        });
      }
      await this.sendPlayerJoinedEvent(response.data);
    } catch (error) {
      console.error("Error in token send event:", error);
      await this.refundTokenAsync(
        event.receiver_id,
        event.sender_id,
        event.amount,
        "Lỗi khi xử lý đăng ký giải đấu"
      );
    }
  }

  private async handleChatRegister(event: TokenSentEvent): Promise<void> {
    try {
      if (event.amount < Number(process.env.REGISTER_FEE)) {
        await this.refundTokenAsync(
          event.receiver_id,
          event.sender_id,
          event.amount,
          "Số tiền gửi không đủ để đăng ký giải đấu");
        return;
      }

      const response = await this._playerService.confirmRegisterAsync(event.sender_id, event.note);
      if (response.statusCode !== StatusCodes.OK) {
        await this.refundTokenAsync(event.receiver_id, event.sender_id, event.amount, response.message);
        return;
      }

      const dmClan = await this.client.clans.fetch('0');
      const customer = await dmClan.users.fetch(event.sender_id);
      if (!customer) {
        customer.sendDM({
          t: response?.message,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: response?.message?.length,
            },
          ],
        });
        return;
      }

      const responsePlayer = await this._playerService.getPlayerByMezonIdAsync(event.sender_id);
      if (responsePlayer.isSuccess) {
        await this.sendPlayerJoinedEvent(responsePlayer.data);
      }
    } catch (error) {
      console.error("Error in token send event:", error);
      await this.refundTokenAsync(
        event.receiver_id,
        event.sender_id,
        event.amount,
        "Lỗi khi xử lý đăng ký giải đấu"
      );
    }
  }

  private async refundTokenAsync(senderId: string, receiverId: string, amount: number, note: string): Promise<void> {
    try {
      await this.client.sendToken({
        sender_id: senderId,
        receiver_id: receiverId,
        amount: amount,
        note: note,
      });
    } catch (error) {
      console.error("Error refunding token:", error);
    }
  }

  public async sendPlayerJoinedEvent(player: PlayerData): Promise<void> {
    try {
      const notifyChannel = await this.client.channels.fetch(process.env.NOTIFY_CHANNEL_ID);
      if (!notifyChannel) {
        console.error("Notify channel not found");
        return;
      }
      const infoMessage =
        `🎉 Chào mừng tuyển thủ ${player.userName} đã tham gia giải đấu NCC Chess Vinh!
      Tên hiển thị: ${player.displayName || "Chưa cập nhật"}
      Ngày đăng ký: ${dayjs(player.createdAt).format('DD/MM/YYYY')}
      Hãy chuẩn bị cho những trận đấu sắp tới!`;
      await notifyChannel.send({
        t: infoMessage,
        mk: [
          {
            type: EMarkdownType.PRE,
            s: 0,
            e: infoMessage.length,
          },
        ],
        embed: [
          {
            color: getRandomColor(),
            title: "Thông tin tuyển thủ",
            description: `
            Tên tuyển thủ: ${player.displayName || player.userName}
            ELO: ${player.elo || 0}
            Slogan: ${player?.note || "Vui là chính, giải thưởng là chủ yếu!"}
            `,
            thumbnail: {
              url: player?.avatarUrl || "https://cdn.mezon.vn/1837043892743049216/1840654271217930240/1827994776956309500/857_0246x0w.webp",
            },
          },
        ]
      });
    } catch (error) {
      console.error("Error sending player joined event:", error);
      return;
    }
  }
}
export default MezonBotService;
