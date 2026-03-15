import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../modules/auth/auth.service';
import { UserRepository } from '../modules/user/user.repository';
import { AppError } from '../shared/exceptions';

jest.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('../config/env', () => ({
  env: {
    jwt: { secret: 'test-secret', expiresIn: '1h' },
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: jest.Mocked<Pick<UserRepository, 'findByEmail'>>;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'admin@example.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin' as const,
    organizationId: null,
  };

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
    };
    service = new AuthService(mockUserRepository as unknown as UserRepository);
  });

  describe('login', () => {
    it('should return token and user payload on valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      const result = await service.login('admin@example.com', 'admin123');

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.user).toEqual({
        userId: 'user-uuid-1',
        email: 'admin@example.com',
        role: 'admin',
        organizationId: null,
      });
    });

    it('should return a valid JWT token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      const result = await service.login('admin@example.com', 'admin123');
      const decoded = jwt.verify(result.token, 'test-secret') as any;

      expect(decoded.userId).toBe('user-uuid-1');
      expect(decoded.email).toBe('admin@example.com');
      expect(decoded.role).toBe('admin');
    });

    it('should throw 401 error when email does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      try {
        await service.login('wrong@example.com', 'admin123');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
        expect((error as AppError).message).toBe('Invalid email or password');
      }
    });

    it('should throw 401 error when password is incorrect', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      try {
        await service.login('admin@example.com', 'wrongpassword');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it('should include organizationId in token for user role', async () => {
      const orgUser = {
        ...mockUser,
        id: 'user-uuid-2',
        email: 'user@example.com',
        role: 'user' as const,
        organizationId: 'org-uuid-1',
        passwordHash: bcrypt.hashSync('password123', 10),
      };
      mockUserRepository.findByEmail.mockResolvedValue(orgUser as any);

      const result = await service.login('user@example.com', 'password123');

      expect(result.user.organizationId).toBe('org-uuid-1');
    });
  });
});
