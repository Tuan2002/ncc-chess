import "module-alias/register";
import Application from "./app";
import container from "./container";
import MezonBotService from "./services/mezon-client/mezon-bot-service";
container.resolve<Application>("Application");
container.resolve<MezonBotService>("MezonBotService");
