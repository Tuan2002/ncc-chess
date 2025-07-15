import { PrismaClient } from "@prisma/client";

export default class PrismaService extends PrismaClient {
  constructor() {
    super(
      { log: ["query", "info", "warn", "error"] }
    );
  }
}