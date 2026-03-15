import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { ReportService } from './report.service';
import { ApiResponse } from '../../shared/helpers/api-response';

@Service()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let meterIds: string[] | undefined;
      if (req.query.meterIds) {
        meterIds = (req.query.meterIds as string).split(',').map((id) => id.trim());
      }

      const report = await this.reportService.getReport(req.user!, meterIds);
      ApiResponse.success(res, report);
    } catch (error) {
      next(error);
    }
  }
}
