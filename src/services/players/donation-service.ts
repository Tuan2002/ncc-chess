import { CreateDonationDto } from "@/models/donations/create-donation";
import PrismaService from "../databases/prisma-service";
import { DonationData } from "@/models/donations/donation-data";
import { plainToInstance } from "class-transformer";
import { StatusCodes } from "http-status-codes";
import { QRCodeType } from "@/constants/qrcode-type";

export class DonationService {
  private _prismaService: PrismaService;

  constructor(PrismaService: PrismaService) {
    this._prismaService = PrismaService;
  }

  async createDonationAsync(donationData: CreateDonationDto): Promise<ServiceResponse> {
    try {
      const existingDonator = await this._prismaService.donation.findFirst({
        where: { mezonId: donationData.mezonId },
      });

      if (existingDonator) {
        const updatedDonator = await this._prismaService.donation.update({
          where: { mezonId: donationData.mezonId },
          data: {
            amount: existingDonator.amount + (donationData.amount || 0),
            displayName: donationData.displayName || existingDonator.displayName,
            avatarUrl: donationData.avatarUrl || existingDonator.avatarUrl,
          },
        });

        return {
          statusCode: StatusCodes.OK,
          isSuccess: true,
          message: "Cập nhật thông tin đóng góp thành công",
          data: plainToInstance(DonationData, updatedDonator, {
            excludeExtraneousValues: true,
          }),
        }
      }

      const newDonation = await this._prismaService.donation.create({
        data: {
          mezonId: donationData.mezonId,
          userName: donationData.userName,
          displayName: donationData.displayName,
          avatarUrl: donationData.avatarUrl,
          amount: donationData.amount || 0,
        },
      });
      return {
        statusCode: StatusCodes.CREATED,
        isSuccess: true,
        message: "Đóng góp thành công",
        data: plainToInstance(DonationData, newDonation, {
          excludeExtraneousValues: true,
        }),
      };
    }
    catch (error) {
      console.error("Error creating donation:", error);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isSuccess: false,
        message: "Lỗi khi tạo đóng góp, vui lòng thử lại sau",
      };
    }
  }

  async getAllDonationsAsync(): Promise<ServiceResponse> {
    try {
      const donations = await this._prismaService.donation.findMany({
        orderBy: { amount: "desc" },
        take: 30,
      });
      return {
        statusCode: StatusCodes.OK,
        isSuccess: true,
        message: "Lấy danh sách đóng góp thành công",
        data: donations.map(donation => plainToInstance(DonationData, donation, { excludeExtraneousValues: true })),
      };
    } catch (error) {
      console.error("Error fetching donations:", error);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isSuccess: false,
        message: "Lỗi máy chủ khi lấy danh sách đóng góp, vui lòng thử lại sau",
      };
    }
  }

  async resetDonationsAsync(): Promise<ServiceResponse> {
    try {
      await this._prismaService.donation.deleteMany({});
      return {
        statusCode: StatusCodes.OK,
        isSuccess: true,
        message: "Đặt lại danh sách đóng góp thành công",
      };
    } catch (error) {
      console.error("Error resetting donations:", error);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isSuccess: false,
        message: "Lỗi máy chủ khi đặt lại danh sách đóng góp, vui lòng thử lại sau",
      };
    }
  } 


  getQrCode(): ServiceResponse {
    const qrCodeDonationData = JSON.stringify({
      receiver_id: process.env.MEZON_BOT_ID,
      receiver_name: 'NCC VINH',
      amount: 1000,
      note: QRCodeType.DONATION,
    });


    return {
      statusCode: StatusCodes.OK,
      isSuccess: true,
      message: "Lấy mã QR thành công",
      data: {
        donationCode: qrCodeDonationData,
      },
    };
  }

  async getSystemStatics(): Promise<ServiceResponse> {
    try {
      const totalDonationAmount = await this._prismaService.donation.aggregate({
        _sum: { amount: true },
      });

      return {
        statusCode: StatusCodes.OK,
        isSuccess: true,
        message: "Lấy thống kê đăng ký thành công",
        data: {
          totalDonationAmount: totalDonationAmount._sum.amount || 0,
        },
      };
    } catch (error) {
      console.error("Error fetching registration statistics:", error);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isSuccess: false,
        message: "Lỗi máy chủ khi lấy thống kê đăng ký, vui lòng thử lại sau",
      };
    }
  }
}