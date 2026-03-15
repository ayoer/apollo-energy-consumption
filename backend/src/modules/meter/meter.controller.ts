import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { MeterService } from './meter.service';
import { ApiResponse } from '../../shared/helpers/api-response';

@Service()
export class MeterController {
  constructor(private readonly meterService: MeterService) {}

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let meters;
      if (req.user?.role === 'admin') {
        meters = await this.meterService.findAll();
      } else {
        meters = await this.meterService.findAccessibleByUser(
          req.user!.userId,
          req.user!.organizationId!
        );
      }
      ApiResponse.success(res, meters);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meter = await this.meterService.create(req.body);
      ApiResponse.created(res, meter);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.meterService.delete(req.params.id as string);
      ApiResponse.message(res, 'Meter deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignToUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.meterService.assignToUser(req.params.meterId as string, req.params.userId as string);
      ApiResponse.message(res, 'Meter assigned to user successfully');
    } catch (error) {
      next(error);
    }
  }

  async unassignFromUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.meterService.unassignFromUser(req.params.meterId as string, req.params.userId as string);
      ApiResponse.message(res, 'Meter unassigned from user successfully');
    } catch (error) {
      next(error);
    }
  }
}
