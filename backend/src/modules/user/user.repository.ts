import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { User } from './user.entity';

@Service()
export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find({
      relations: ['organization'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        organization: { id: true, name: true },
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['organization', 'assignedMeters'],
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        organization: { id: true, name: true },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async findByIdWithMeters(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['assignedMeters'],
    });
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
