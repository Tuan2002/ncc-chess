import { PlayerService } from "@/services/players/player-service";
import { GET, route } from "awilix-express";
import { Request, Response } from "express";
@route("/chess")
export default class ChessController {
  private _playerService: PlayerService;
  constructor(PlayerService: PlayerService) {
    this._playerService = PlayerService;
  }

  @GET()
  @route("/players")
  public async getPlayers(req: Request, res: Response) {
    const response = await this._playerService.getAllPlayersAsync();
    return res.status(response.statusCode).json(response);
  }

  @GET()
  @route("/code/qr")
  public async getRegisterCode(req: Request, res: Response) {
    const response = this._playerService.getQrCode();
    return res.status(response.statusCode).json(response);
  }

  @GET()
  @route("/statistic")
  public async getSystemStatistics(req: Request, res: Response) {
    const response = await this._playerService.getSystemStatics();
    return res.status(response.statusCode).json(response);
  }
}
