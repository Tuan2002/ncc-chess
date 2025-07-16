import "module-alias/register";
import Application from "./app";
import container from "./container";
import PrismaService from "./services/databases/prisma-service";
import MezonBotService from "./services/mezon-client/mezon-bot-service";
container.resolve<Application>("Application");
container.resolve<MezonBotService>("MezonBotService");
container.resolve<PrismaService>("PrismaService");
