import { getRandomColor } from "@/helpers/color";
import { ChannelMessage, EMarkdownType, MezonClient } from "mezon-sdk";
import QRCode from "qrcode";
import { DonationService } from "../players/donation-service";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { MmnClient } from "mmn-client-js";
import { NumberUtil } from "@/helpers/number-format";
export class PlayersMessagesService {

  private client: MezonClient;
  private donationService: DonationService;

  public injectClient(client: MezonClient): void {
    this.client = client;
  }

  constructor(
    DonationService: DonationService
  ) {
    this.donationService = DonationService;
  }

  public async transferReward(event: ChannelMessage): Promise<void> {
    try {
      const currentChannel = await this.client.channels.fetch(event.channel_id);
      if (!currentChannel) {
        return;
      }
      const currentMessage: Message = await currentChannel.messages.fetch(event.message_id);
      const senderId = event.sender_id;
      if (senderId !== process.env.BOT_OWNER_ID) {
        const replyMessage = `Chỉ có quản trị bot mới có thể thực hiện lệnh này.`;
        await currentMessage.reply({
          t: replyMessage,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: replyMessage.length,
            },
          ],
        });
        return;
      }
      const [prefix, command, amount, ...args] = event.content?.t?.split(" ");
      const receiverIds = event.mentions?.map(m => m.user_id) || [];
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        const replyMessage = `Vui lòng cung cấp số tiền hợp lệ để chuyển.`;
        await currentMessage.reply({
          t: replyMessage,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: replyMessage.length,
            },
          ],
        }
        );
        return;
      }
      if (receiverIds.length === 0) {
        const replyMessage = `Vui lòng mention danh sách người nhận để chuyển tiền.`;
        await currentMessage.reply({
          t: replyMessage,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: replyMessage.length,
            },
          ],
        });
        return;
      }
      await Promise.all(receiverIds.map(async (receiverId) => {
        const transferData = {
          receiver_id: receiverId,
          amount: Number(amount),
          note: "Chuyển tiền Donation",
        };
        await this.client.sendToken(transferData);
        const replyMessage = `Đã chuyển ${Number(amount).toLocaleString("vi-VN")} VNĐ cho <${receiverId}> thành công!`;
        await currentMessage?.reply({
          t: replyMessage,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: replyMessage.length,
            },
          ],
        });
      }));
    } catch (error) {
      const currentChannel = await this.client.channels.fetch(event.channel_id);
      if (currentChannel) {
        const currentMessage: Message = await currentChannel.messages.fetch(event.message_id);
        await currentMessage.reply({
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
    }
  }

  public async withdrawFunds(event: ChannelMessage): Promise<void> {
    try {
      const currentChannel = await this.client.channels.fetch(event.channel_id);
      if (!currentChannel) {
        return;
      }
      const currentMessage: Message = await currentChannel.messages.fetch(event.message_id);
      const ownerId = process.env.BOT_OWNER_ID;
      const senderId = event.sender_id;
      if (senderId !== ownerId) {
        const replyMessage = `Chỉ có quản trị bot mới có thể thực hiện lệnh này.`;
        await currentMessage.reply({
          t: replyMessage,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: replyMessage.length,
            },
          ],
        });
        return;
      }
      const [prefix, command, amount] = event.content?.t?.split(" ");
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        const replyMessage = `Vui lòng cung cấp số tiền hợp lệ để rút.`;
        await currentMessage.reply({
          t: replyMessage,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: replyMessage.length,
            },
          ],
        }
        );
        return;
      }

      await this.client.sendToken({
        receiver_id: ownerId,
        amount: Number(amount),
        note: "Rút tiền từ quỹ Vinh",
      });

      const replyMessage = `Đã rút ${Number(amount).toLocaleString("vi-VN")} VNĐ từ quỹ thành công!`;
      await currentMessage?.reply({
        t: replyMessage,
        mk: [
          {
            type: EMarkdownType.PRE,
            s: 0,
            e: replyMessage.length,
          },
        ],
      });
    } catch (error) {
      const currentChannel = await this.client.channels.fetch(event.channel_id);
      if (currentChannel) {
        const currentMessage: Message = await currentChannel.messages.fetch(event.message_id);
        await currentMessage.reply({
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
    }
  }

  public async donation(event: ChannelMessage): Promise<void> {
    try {
      const currentChannel = await this.client.channels.fetch(event.channel_id);
      if (!currentChannel) {
        return;
      }

      const currentMessage: Message = await currentChannel.messages.fetch(event.message_id);

      const qrCodeData = JSON.stringify({
        receiver_id: process.env.MEZON_BOT_ID,
        receiver_name: 'NCC VINH'
      });
      const qrCodeURL = await QRCode.toDataURL(qrCodeData);
      await currentMessage.reply({
        embed: [
          {
            title: 'Quyên góp NCC VINH',
            description: `Quét mã QR hoặc gửi TOKEN cho BOT để quyên góp!`,
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

    } catch (error) {
      const currentChannel = await this.client.channels.fetch(event.channel_id);
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

  public async resetDonations(event: ChannelMessage): Promise<void> {
    try {
      const currentChannel = await this.client.channels.fetch(event.channel_id);
      if (!currentChannel) {
        return;
      }
      const currentMessage: Message = await currentChannel.messages.fetch(event.message_id);
      const senderId = event.sender_id;
      if (senderId !== process.env.BOT_OWNER_ID) {
        const replyMessage = `Chỉ có quản trị bot mới có thể thực hiện lệnh này.`;
        await currentMessage.reply({
          t: replyMessage,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: replyMessage.length,
            },
          ],
        });
        return;
      }

      const response = await this.donationService.resetDonationsAsync();
      if (!response || !response.isSuccess) {
        await currentChannel.send({
          t: response?.message || "Lỗi khi đặt lại danh sách đóng góp, vui lòng thử lại sau",
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: response?.message?.length || 0,
            },
          ],
        });
        return;
      }
      await currentMessage.reply({
        t: response.message,
        mk: [
          {
            type: EMarkdownType.PRE,
            s: 0,
            e: response.message.length,
          },
        ],
      });
    } catch (error) {
      const currentChannel = await this.client.channels.fetch(event.channel_id);
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
    }
  }

  public async getDonations(event: ChannelMessage): Promise<void> {
    try {
      const DEFAULT_TAKE = 30;
      const currentChannel = await this.client.channels.fetch(event.channel_id);
      if (!currentChannel) {
        return;
      }

      const [prefix, command, value, ...args] = event.content?.t?.split(" ");
      const take = value && !isNaN(Number(value)) && Math.abs(Number(value)) > 0 ? Number(value) : DEFAULT_TAKE;
      const mentionIds = event.mentions?.map(m => m.user_id) || [];
      const response = await this.donationService.getAllDonationsAsync(mentionIds, take);
      if (!response || !response.isSuccess) {
        await currentChannel.send({
          t: response?.message || "Lỗi khi lấy danh sách đóng góp, vui lòng thử lại sau",
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: response?.message?.length || 0,
            },
          ],
        });
        return;
      }
      const donations = response.data;
      if (donations.length === 0) {
        await currentChannel.send({
          t: "Hiện tại không có đóng góp nào.",
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
            },
          ],
        });
        return;
      }
      const donationsList = donations.map((donation, index) =>
        `${index + 1}. ${donation.userName}: ${donation.amount.toLocaleString("vi-VN") || 0} VNĐ`).join('\n');

      await currentChannel.send({
        embed: [
          {
            color: getRandomColor(),
            title: mentionIds && mentionIds?.length > 0
              ? "THÔNG TIN QUYÊN GÓP" : `TOP ${take} NGƯỜI QUYÊN GÓP NHIỀU NHẤT`,
            description: '```' + donationsList + '```',
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
      console.error("Error fetching donations:", error);
    }
  }

  public async getSystemStatistics(event: ChannelMessage): Promise<void> {
    try {
      const currentChannel = await this.client.channels.fetch(event.channel_id);
      if (!currentChannel) {
        return;
      }
      const response = await this.donationService.getSystemStatics();
      if (!response || !response.isSuccess) {
        await currentChannel.send({
          t: response?.message || "Lỗi khi lấy thống kê hệ thống, vui lòng thử lại sau",
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: response?.message?.length || 0,
            },
          ],
        });
        return;
      }
      const statistics = response.data;

      const DEFAULT_TIMEOUT = 2000
      const mmnClient = new MmnClient({
        baseUrl: 'https://dong.mezon.ai/mmn-api',
        timeout: DEFAULT_TIMEOUT,
      })
      const botAccount = await mmnClient.getAccountByUserId(process.env.MEZON_BOT_ID);
      const botBalance =  Number(botAccount.balance) > 0 ? NumberUtil.toScaled(botAccount.balance) : 0;

      const embedMessage = {
        color: getRandomColor(),
        title: "THỐNG KÊ HỆ THỐNG",
        description: `
          - Tổng số tiền quyên góp: ${Number(statistics.totalDonationAmount).toLocaleString("vi-VN")} VNĐ
          - Số tiền quỹ hiện tại: ${botBalance.toLocaleString("vi-VN")} VNĐ
        `,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Powered by Mezon',
          icon_url:
            'https://cdn.mezon.vn/1837043892743049216/1840654271217930240/1827994776956309500/857_0246x0w.webp',
        },
      };
      await currentChannel.send({
        embed: [embedMessage],
      });
    } catch (error) {
      console.error("Error fetching system statistics:", error);
    }
  }

}