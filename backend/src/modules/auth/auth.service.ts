import { Service } from 'typedi';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../user/user.repository';
import { UnauthorizedError } from '../../shared/exceptions';
import { env } from '../../config/env';
import { JwtPayload } from '../../shared/middlewares/auth.middleware';

@Service()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(email: string, password: string): Promise<{ token: string; user: Omit<JwtPayload, 'iat' | 'exp'> }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const token = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn as string,
    } as jwt.SignOptions);

    return { token, user: payload };
  }
}
