import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../shared/helpers/api-response';

@Service()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.findById(req.params.id as string);
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.findAll();
      ApiResponse.success(res, users);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.create(req.body);
      ApiResponse.created(res, user);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.userService.delete(req.params.id as string);
      ApiResponse.message(res, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
