import { ChatCommands } from "@/constants/chat-commands";
import { ChannelMessage, MezonClient } from "mezon-sdk";
import { CommonMessagesService } from "../bot-messages/common-messages";

class MezonBotService {
  private client: MezonClient;
  private _commonMessagesService: CommonMessagesService;
  constructor(CommonMessagesService: CommonMessagesService) {
    this.client = new MezonClient(process.env.MEZON_BOT_TOKEN);
    this.client.login().then(() => {
      console.log("Mezon Bot is ready!");
    }
    )
    this._commonMessagesService = CommonMessagesService;
    this._commonMessagesService.injectClient(this.client);
    this.client.onChannelMessage(this.listenChanelMessages);

  }

  public listenChanelMessages = (event: ChannelMessage) => {
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

      default:
        break;
    }
  }
}
export default MezonBotService;
