import { DonationService } from "@/services/players/donation-service";
import { GET, route } from "awilix-express";
import { Request, Response } from "express";

@route("/donation")
export default class DonationController {
  private _donationService: DonationService;
  constructor(DonationService: DonationService) {
    this._donationService = DonationService;
  }

  @GET()
  @route("/code/qr")
  public async getRegisterCode(req: Request, res: Response) {
    const response = this._donationService.getQrCode();
    return res.status(response.statusCode).json(response);
  }

  @GET()
  @route("/statistic")
  public async getSystemStatistics(req: Request, res: Response) {
    const response = await this._donationService.getSystemStatics();
    return res.status(response.statusCode).json(response);
  }
}
