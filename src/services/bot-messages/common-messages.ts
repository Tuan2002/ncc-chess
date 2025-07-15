import { ChannelMessage, MezonClient } from "mezon-sdk";

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
        - *help: Hiển thị danh sách các câu lệnh`
            ;
        currentChannel.send({
            t: replyMessage,
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