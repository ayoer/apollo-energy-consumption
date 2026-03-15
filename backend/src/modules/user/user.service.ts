import { Service } from 'typedi';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { CreateUserDto } from './user.dto';
import { ConflictError, NotFoundError, ValidationError } from '../../shared/exceptions';
import { AppDataSource } from '../../config/database';
import { Meter } from '../meter/meter.entity';

@Service()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    if (dto.role === 'user' && !dto.organizationId) {
      throw new ValidationError('Users must belong to an organization');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return AppDataSource.transaction(async (manager) => {
      const userEntity = manager.create(User, {
        email: dto.email,
        passwordHash,
        role: dto.role,
        organizationId: dto.organizationId || null,
      });
      const savedUser = await manager.save(userEntity);

      if (dto.organizationId) {
        const orgMeters = await manager.find(Meter, {
          where: { organizationId: dto.organizationId },
        });

        if (orgMeters.length) {
          savedUser.assignedMeters = orgMeters;
          await manager.save(savedUser);
        }
      }

      const { passwordHash: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword as Omit<User, 'passwordHash'>;
    });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('User not found');
    }
  }
}
