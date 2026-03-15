import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { Organization } from './organization.entity';

@Service()
export class OrganizationRepository {
  private repository: Repository<Organization>;

  constructor() {
    this.repository = AppDataSource.getRepository(Organization);
  }

  async findAll(): Promise<Organization[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Organization | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<Organization>): Promise<Organization> {
    const org = this.repository.create(data);
    return this.repository.save(org);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
