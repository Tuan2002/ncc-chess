import { RegisterStatus } from "@/constants/resgister-status";
import { CreatePlayerDto } from "@/models/players/create-player";
import { PlayerData } from "@/models/players/player-data";
import { RegisterData } from "@/models/players/register-data";
import { plainToInstance } from "class-transformer";
import { StatusCodes } from "http-status-codes";
import randomstring from "randomstring";
import PrismaService from "../databases/prisma-service";
export class PlayerService {
  private _prismaService: PrismaService;

  constructor(PrismaService: PrismaService) {
    this._prismaService = PrismaService;
  }

  public async registerPlayerAsync(createPlayerDto: CreatePlayerDto): Promise<ServiceResponse> {
    try {
      const existingPlayer = await this._prismaService.player.findFirst({
        where: { OR: [{ mezonId: createPlayerDto.mezonId }, { userName: createPlayerDto.userName }] },
      });

      if (existingPlayer && existingPlayer.status === RegisterStatus.APPROVED) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          isSuccess: false,
          message: "Bạn đã đăng ký tham gia rồi, mỗi người chỉ được đăng ký một lần duy nhất",
        };
      }

      if (existingPlayer && existingPlayer.status === RegisterStatus.PENDING) {
        return {
          statusCode: StatusCodes.OK,
          isSuccess: true,
          message: "Bạn đã gửi yêu cầu đăng ký, vui lòng thanh toán lệ phí để hoàn tất đăng ký",
          data: plainToInstance(RegisterData, existingPlayer, {
            excludeExtraneousValues: true,
          })
        };
      }

      const registerKey = randomstring.generate()
      const newPlayer = await this._prismaService.player.create({
        data: {
          mezonId: createPlayerDto.mezonId,
          userName: createPlayerDto.userName,
          email: createPlayerDto?.email,
          displayName: createPlayerDto?.displayName,
          avatarUrl: createPlayerDto?.avatarUrl,
          registerKey: registerKey,
          status: RegisterStatus.PENDING,
        },
      });

      return {
        statusCode: StatusCodes.OK,
        isSuccess: true,
        message: "Đăng ký thành công, vui lòng thanh toán lệ phí để hoàn tất đăng ký",
        data: plainToInstance(RegisterData, newPlayer, {
          excludeExtraneousValues: true,
        }),
      };

    }
    catch (error) {
      console.error("Error registering player:", error);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isSuccess: false,
        message: "Lỗi máy chủ khi đăng ký, vui lòng thử lại sau",
      };
    }
  }

  public async confirmRegisterAsync(registerKey: string): Promise<ServiceResponse> {
    try {
      const player = await this._prismaService.player.findFirst({
        where: { registerKey: registerKey },
      });

      if (!player) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          isSuccess: false,
          message: "Không tìm thấy người chơi",
        };
      }

      if (player.status !== RegisterStatus.PENDING) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          isSuccess: false,
          message: "Mã đăng ký không hợp lệ hoặc người chơi đã được xác nhận trước đó",
        };
      }

      await this._prismaService.player.update({
        where: { id: player.id },
        data: { status: RegisterStatus.APPROVED },
      });

      return {
        statusCode: StatusCodes.OK,
        isSuccess: true,
        message: "Xác nhận đăng ký thành công",
      };
    } catch (error) {
      console.error("Error confirming registration:", error);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isSuccess: false,
        message: "Lỗi máy chủ khi xác nhận đăng ký, vui lòng thử lại sau",
      };
    }
  }

  async getAllPlayersAsync(): Promise<ServiceResponse> {
    try {
      const players = await this._prismaService.player.findMany({
        where: { status: RegisterStatus.APPROVED },
      });

      return {
        statusCode: StatusCodes.OK,
        isSuccess: true,
        message: "Lấy danh sách người chơi thành công",
        data: players.map(player => plainToInstance(PlayerData, player, { excludeExtraneousValues: true })),
      };

    } catch (error) {
      console.error("Error fetching players:", error);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isSuccess: false,
        message: "Lỗi máy chủ khi lấy danh sách người chơi, vui lòng thử lại sau",
      };
    }
  }
}