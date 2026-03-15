import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../shared/helpers/api-response';

@Service()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
