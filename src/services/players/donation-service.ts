import { CreateDonationDto } from "@/models/donations/create-donation";
import PrismaService from "../databases/prisma-service";
import { DonationData } from "@/models/donations/donation-data";
import { plainToInstance } from "class-transformer";
import { StatusCodes } from "http-status-codes";

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
        take: 10,
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
}