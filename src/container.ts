import { asClass, createContainer, InjectionMode } from "awilix";
import "dotenv/config";
import Application from "./app";
import { CommonMessagesService } from "./services/bot-messages/common-messages";
import { PlayersMessagesService } from "./services/bot-messages/donation-messages";
import PrismaService from "./services/databases/prisma-service";
import MezonBotService from "./services/mezon-client/mezon-bot-service";
import { DonationService } from "./services/players/donation-service";

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

// Register the services
container.register({
  Application: asClass(Application).singleton(),
  PrismaService: asClass(PrismaService).singleton(),
  MezonBotService: asClass(MezonBotService).singleton(),
  DonationService: asClass(DonationService).singleton(),
  CommonMessagesService: asClass(CommonMessagesService).singleton(),
  PlayersMessagesService: asClass(PlayersMessagesService).singleton()
});
export default container;
