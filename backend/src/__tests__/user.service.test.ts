import 'reflect-metadata';
import { UserService } from '../modules/user/user.service';
import { UserRepository } from '../modules/user/user.repository';
import { AppError } from '../shared/exceptions';

const mockManager = {
  create: jest.fn().mockImplementation((_entity, data) => ({ ...data, id: 'new-user-uuid' })),
  save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  find: jest.fn(),
};

jest.mock('../config/database', () => ({
  AppDataSource: {
    transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<Pick<UserRepository, 'findAll' | 'findById' | 'findByEmail' | 'create' | 'delete'>>;

  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    service = new UserService(mockUserRepository as unknown as UserRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userDto = {
      email: 'new@example.com',
      password: 'password123',
      role: 'user' as const,
      organizationId: 'org-uuid-1',
    };

    it('should throw 409 when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing' } as any);

      try {
        await service.create(userDto);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(409);
        expect((error as AppError).message).toBe('A user with this email already exists');
      }
    });

    it('should throw 400 when user role has no organizationId', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      try {
        await service.create({ ...userDto, organizationId: undefined });
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toBe('Users must belong to an organization');
      }
    });

    it('should auto-assign all organization meters to new user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const orgMeters = [
        { id: 'meter-1', name: 'Meter A', organizationId: 'org-uuid-1' },
        { id: 'meter-2', name: 'Meter B', organizationId: 'org-uuid-1' },
      ];
      mockManager.find.mockResolvedValue(orgMeters);

      await service.create(userDto);

      expect(mockManager.find).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledTimes(2);
      const secondSaveCall = mockManager.save.mock.calls[1][0];
      expect(secondSaveCall.assignedMeters).toEqual(orgMeters);
    });

    it('should create user without meter assignment when no org meters exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockManager.find.mockResolvedValue([]);

      await service.create(userDto);

      expect(mockManager.save).toHaveBeenCalledTimes(1);
    });

    it('should not return passwordHash in response', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockManager.find.mockResolvedValue([]);

      const result = await service.create(userDto);

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should allow admin role without organizationId', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const adminDto = {
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin' as const,
        organizationId: undefined,
      };

      await expect(service.create(adminDto)).resolves.toBeDefined();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockUser as any);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
    });

    it('should throw 404 when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      try {
        await service.findById('non-existent');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockUserRepository.delete.mockResolvedValue(true);

      await expect(service.delete('user-1')).resolves.toBeUndefined();
    });

    it('should throw 404 when user to delete does not exist', async () => {
      mockUserRepository.delete.mockResolvedValue(false);

      try {
        await service.delete('non-existent');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });
});
