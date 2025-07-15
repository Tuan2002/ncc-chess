import { asClass, createContainer, InjectionMode } from "awilix";
import "dotenv/config";
import Application from "./app";
import { CommonMessagesService } from "./services/bot-messages/common-messages";
import PrismaService from "./services/databases/prisma-service";
import MezonBotService from "./services/mezon-client/mezon-bot-service";
const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

// Register the services
container.register({
  Application: asClass(Application).singleton(),
  PrismaService: asClass(PrismaService).singleton(),
  MezonBotService: asClass(MezonBotService).singleton(),
  CommonMessagesService: asClass(CommonMessagesService).scoped(),
});
export default container;
