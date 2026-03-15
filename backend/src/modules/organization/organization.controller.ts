import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from './organization.service';
import { ApiResponse } from '../../shared/helpers/api-response';

@Service()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizations = await this.organizationService.findAll();
      ApiResponse.success(res, organizations);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organization = await this.organizationService.create(req.body);
      ApiResponse.created(res, organization);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.organizationService.delete(req.params.id as string);
      ApiResponse.message(res, 'Organization deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
