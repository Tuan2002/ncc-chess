import { ChatCommands } from "@/constants/chat-commands";
import { NCC_USERS } from "@/constants/ncc-users";
import { getRandomColor } from "@/helpers/color";
import { NCCUser } from "@/types/ncc-user";
import dayjs from "dayjs";
import { ChannelMessage, EMarkdownType, MezonClient, TokenSentEvent } from "mezon-sdk";
import { CommonMessagesService } from "../bot-messages/common-messages";
import { PlayersMessagesService } from "../bot-messages/donation-messages";
import { DonationService } from "../players/donation-service";
import { DonationData } from "@/models/donations/donation-data";
import { CreateDonationDto } from "@/models/donations/create-donation";
class MezonBotService {

  private client: MezonClient;
  private _commonMessagesService: CommonMessagesService;
  private _playersMessagesService: PlayersMessagesService;
  private _donationService: DonationService;

  constructor(
    CommonMessagesService: CommonMessagesService,
    PlayersMessagesService: PlayersMessagesService,
    DonationService: DonationService
  ) {
    this.client = new MezonClient({
      botId: process.env.MEZON_BOT_ID,
      token: process.env.MEZON_BOT_TOKEN
    });
    this.client.login().then(() => {
      console.log("Mezon Bot is ready!");
    })
    this._donationService = DonationService;
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

      case commandMessage.match(ChatCommands.DONATE)?.input:
        this._playersMessagesService.donation(event);
        break;

      case commandMessage.match(ChatCommands.DONATION)?.input:
        this._playersMessagesService.getSystemStatistics(event);
        break;

      case commandMessage.match(ChatCommands.DONATORS)?.input:
        this._playersMessagesService.getDonations(event);
        break;
      
      case commandMessage.match(ChatCommands.RESET)?.input:
        this._playersMessagesService.resetDonations(event);
        break;
        
      case commandMessage.match(ChatCommands.TRANSFER)?.input:
        this._playersMessagesService.transferReward(event);
        break;

      case commandMessage.match(ChatCommands.WITHDRAW)?.input:
        this._playersMessagesService.withdrawFunds(event);
        break;

      default:
        break;
    }
  }

  private listTokenSendEvent = async (event: TokenSentEvent) => {
    if (event.sender_id === process.env.MEZON_BOT_ID || event.sender_id === event.receiver_id) {
      return;
    }
    await this.handleDonation(event);
  }

  private async handleDonation(event: TokenSentEvent): Promise<void> {
    try {
      const nccUser: NCCUser = NCC_USERS.find(user => user.id === event.sender_id);
      const donationData: CreateDonationDto = {
        mezonId: event.sender_id,
        userName: event.sender_name,
        displayName: nccUser?.display_name || event.sender_name,
        avatarUrl: nccUser?.avatar_url,
        amount: event.amount,
      };

      const response = await this._donationService.createDonationAsync(donationData);
      if (!response.isSuccess) {
        await this.refundTokenAsync(
          event.receiver_id,
          event.sender_id,
          event.amount,
          response.message || "Lỗi khi gửi quyên góp, vui lòng thử lại sau"
        );
        return;
      }

      await this.sendDonationEvent(response.data);
    } catch (error) {
      console.error("Error handling donation:", error);
      await this.refundTokenAsync(
        event.receiver_id,
        event.sender_id,
        event.amount,
        "Lỗi khi xử lý quyên góp"
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


  public async sendDonationEvent(donationData: DonationData): Promise<void> {
    try {
      const notifyChannel = await this.client.channels.fetch(process.env.NOTIFY_CHANNEL_ID);
      if (!notifyChannel) {
        console.error("Notify channel not found");
        return;
      }

      const donationMessage = `💰 Nhận tiền quyên góp từ: ${donationData.userName}`;
      await notifyChannel.send({
        t: donationMessage,
        mk: [
          {
            type: EMarkdownType.PRE,
            s: 0,
            e: donationMessage.length,
          },
        ],
        embed: [
          {
            color: getRandomColor(),
            title: "Thông tin quyên góp",
            description: `
            Người dùng: ${donationData.userName}
            Số tiền đã quyên góp: ${donationData.amount.toLocaleString("vi-VN") || 0} đồng
            Ngày cập nhật: ${dayjs(donationData.updatedAt).format('DD/MM/YYYY')}
            `,
            thumbnail: {
              url: donationData.avatarUrl || "https://cdn.mezon.vn/1837043892743049216/1840654271217930240/1827994776956309500/857_0246x0w.webp",
            },
          },
        ]
      });
    } catch (error) {
      console.error("Error sending donation event:", error);
    }
  }
}
export default MezonBotService;
