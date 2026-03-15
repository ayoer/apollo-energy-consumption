import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { MeterReadingService } from './meter-reading.service';
import { ApiResponse } from '../../shared/helpers/api-response';

@Service()
export class MeterReadingController {
  constructor(private readonly meterReadingService: MeterReadingService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reading = await this.meterReadingService.create(req.body);
      ApiResponse.created(res, reading);
    } catch (error) {
      next(error);
    }
  }
}
