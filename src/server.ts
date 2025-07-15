import express from 'express';

process.on('uncaughtException', (err: any) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason: any, promise: any) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
export default class Server {
  public app = express();
  // public router = MasterRouter;
}
