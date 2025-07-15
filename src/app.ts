import { asyncLocalStorageMiddleware } from "@/middlewares";
import { loadControllers, scopePerRequest } from "awilix-express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import { createServer, Server } from "http";
import { corsConfig } from "./configs/corsConfig";
import container from "./container";
import expressApp from "./server";

/**
 * Application class.
 * @description Handle init config and components.
 */
class Application {
  server: expressApp;
  serverInstance: Server;
  constructor() {
    this.initServer();
    if (!this.serverInstance) {
      this.start();
    }
  }

  private initServer() {
    this.server = new expressApp();
  }
  start() {
    ((port = process.env.APP_PORT || 5001) => {
      this.serverInstance = createServer(this.server.app).listen(port, () => {
        console.log(`Bot running at http://localhost:${port}`);
      });
      this.server.app.use(cors(corsConfig));
      this.server.app.use(cookieParser());
      this.server.app.use(bodyParser.json());
      this.server.app.use(bodyParser.urlencoded({ extended: true }));
      this.server.app.use(scopePerRequest(container));
      this.server.app.use(asyncLocalStorageMiddleware());
    })();
  }
  close() {
    this.serverInstance.close();
  }
}
export default Application;
