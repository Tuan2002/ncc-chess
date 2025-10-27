import { ChannelMessage, EMarkdownType, MezonClient } from "mezon-sdk";

export class CommonMessagesService {
    private client: MezonClient;

    public injectClient(client: MezonClient): void {
        this.client = client;
    }

    public ping(event: ChannelMessage): void {
        const currentChannel = this.client.channels.get(event.channel_id);
        const replyMessage = `Xin chào ${event.display_name}! Hệ thống đang hoạt động bình thường`;
        currentChannel.send({
            t: replyMessage,
        });
    }

    public help(event: ChannelMessage): void {
        const currentChannel = this.client.channels.get(event.channel_id);
        const replyMessage =
        `Xin chào ${event.display_name}! Đây là một số câu lệnh có thể sử dụng:
        - *ping: Kiểm tra trạng thái bot
        - *help: Hiển thị danh sách các câu lệnh
        - *vinh donate: Lấy mã QR để quyên góp
        - *vinh donation: Hiển thị thông tin quỹ
        - *vinh donator: Hiển thị danh sách quyên góp
        - *vinh reset: Đặt lại danh sách đóng góp
        - *vinh transfer <số tiền> @<Người nhận 1> @<Người nhận 2>: Chuyển tiền cho người dùng
        `;
        const currentMessage = currentChannel.messages.get(event.message_id);
        currentMessage.reply({
            t: replyMessage,
            mk: [
                {
                    type: EMarkdownType.PRE,
                    s: 0,
                    e: replyMessage.length,
                },
            ],
        });
    }

    public invalidCommand(event: ChannelMessage): void {
        const currentChannel = this.client.channels.get(event.channel_id);
        const replyMessage = `Câu lệnh không hợp lệ! Vui lòng kiểm tra lại cú pháp hoặc tham khảo tài liệu hướng dẫn sử dụng bot`;
        currentChannel.send({
            t: replyMessage,
        });
    }
}