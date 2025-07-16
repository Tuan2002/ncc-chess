import { getRandomColor } from "@/helpers/color";
import { CreatePlayerDto } from "@/models/players/create-player";
import { PlayerData } from "@/models/players/player-data";
import { plainToInstance } from "class-transformer";
import dayjs from "dayjs";
import { StatusCodes } from "http-status-codes";
import { ChannelMessage, EMarkdownType, MezonClient } from "mezon-sdk";
import QRCode from "qrcode";
import { PlayerService } from "../players/player-service";
export class PlayersMessagesService {

  private client: MezonClient;
  private playerService: PlayerService;

  public injectClient(client: MezonClient): void {
    this.client = client;
  }

  constructor(PlayerService: PlayerService) {
    this.playerService = PlayerService;
  }

  public async register(event: ChannelMessage): Promise<void> {
    try {
      const currentChannel = this.client.channels.get(event.channel_id);
      if (!currentChannel) {
        return;
      }

      const registerData = plainToInstance(CreatePlayerDto, {
        mezonId: event.sender_id,
        userName: event?.username || event.sender_id,
        displayName: event?.display_name,
        avatarUrl: event?.avatar
      });

      const response = await this.playerService.registerPlayerAsync(registerData);
      if (!response && response.statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
        throw new Error(response?.message || "Lỗi máy chủ, vui lòng thử lại sau");
      }

      if (response.statusCode === StatusCodes.BAD_REQUEST) {
        await currentChannel.send({
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
      await currentChannel.send({
        t: response?.message,
        mk: [
          {
            type: EMarkdownType.PRE,
            s: 0,
            e: response?.message?.length,
          },
        ],
      });
      await this.sendPaymentQR(event.sender_id, response.data.registerKey);

    } catch (error) {
      const currentChannel = this.client.channels.get(event.channel_id);
      if (currentChannel) {
        await currentChannel.send({
          t: error.message,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: error?.message?.length,
            },
          ],
        });
      }
    };
  }

  public async getPlayers(event: ChannelMessage): Promise<void> {
    try {
      const currentChannel = this.client.channels.get(event.channel_id);
      if (!currentChannel) {
        return;
      }
      const players = await this.playerService.getAllPlayersAsync();
      if (!players || !players.isSuccess) {
        return;
      }
      if (players.data.length === 0) {
        await currentChannel.send({
          t: "Hiện tại không có người chơi nào đã đăng ký giải đấu.",
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
            },
          ],
        });
        return;
      }

      const playersList: string[] =
        players.data?.map((player: PlayerData, index) =>
          `${index + 1}. ${player.userName}
       - ELO: ${player?.elo}
       - Slogan: ${player?.note || "Vui là chính, giải thưởng là chủ yếu"}
       - Ngày đăng ký: ${dayjs(player.createdAt).format('DD/MM/YYYY')}`,
        );
      const replyMessage = playersList.join('\n\n');
      await currentChannel.send({
        embed: [
          {
            color: getRandomColor(),
            title: `DANH SÁCH TUYỂN THỦ GIẢI ĐẤU NCC CHESS VINH`,
            description: '```' + replyMessage + '```',
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Powered by Mezon',
              icon_url:
                'https://cdn.mezon.vn/1837043892743049216/1840654271217930240/1827994776956309500/857_0246x0w.webp',
            },
          },
        ]
      });
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  }

  private async sendPaymentQR(userId: string, registerKey: string): Promise<void> {

    const qrCodeData = JSON.stringify({
      receiver_id: process.env.MEZON_BOT_ID,
      receiver_name: 'NCC Chess Vinh',
      amount: process.env.REGISTER_FEE || 1,
      note: registerKey
    });

    const qrCodeURL = await QRCode.toDataURL(qrCodeData);
    const dmClan = await this.client.clans.fetch('0');
    const user = await dmClan.users.fetch(userId);

    if (user) {
      await user.sendDM({
        embed: [
          {
            title: 'Thanh toán lệ phí đăng ký giải đấu NCC Chess Vinh',
            description: `Quét mã QR hoặc gửi ${process.env.REGISTER_FEE || 1} TOKEN cho BOT với nội dung: ${registerKey} để hoàn tất đăng ký`,
            image: {
              url: qrCodeURL,
            },
            footer: {
              text: 'Powered by Mezon',
              icon_url:
                'https://cdn.mezon.vn/1837043892743049216/1840654271217930240/1827994776956309500/857_0246x0w.webp',
            },
          },
        ],
      });
    }
  }

}