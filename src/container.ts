import { asClass, createContainer, InjectionMode } from "awilix";
import "dotenv/config";
import Application from "./app";
import { CommonMessagesService } from "./services/bot-messages/common-messages";
import { PlayersMessagesService } from "./services/bot-messages/players-messages";
import PrismaService from "./services/databases/prisma-service";
import MezonBotService from "./services/mezon-client/mezon-bot-service";
import { PlayerService } from "./services/players/player-service";
const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

// Register the services
container.register({
  Application: asClass(Application).singleton(),
  PrismaService: asClass(PrismaService).singleton(),
  MezonBotService: asClass(MezonBotService).singleton(),
  PlayerService: asClass(PlayerService).singleton(),
  CommonMessagesService: asClass(CommonMessagesService).singleton(),
  PlayersMessagesService: asClass(PlayersMessagesService).singleton()
});
export default container;
