import { Service } from 'typedi';
import { In, Repository } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { Meter } from './meter.entity';

@Service()
export class MeterRepository {
  private repository: Repository<Meter>;

  constructor() {
    this.repository = AppDataSource.getRepository(Meter);
  }

  async findAll(): Promise<Meter[]> {
    return this.repository.find({
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Meter | null> {
    return this.repository.findOne({ where: { id }, relations: ['organization'] });
  }

  async findByOrganizationId(organizationId: string): Promise<Meter[]> {
    return this.repository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdsAndOrganization(ids: string[], organizationId: string): Promise<Meter[]> {
    return this.repository.find({
      where: { id: In(ids), organizationId },
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }

  async findForReport(options: {
    organizationId?: string;
    meterIds?: string[];
  }): Promise<Meter[]> {
    const query = this.repository
      .createQueryBuilder('meter')
      .leftJoinAndSelect('meter.organization', 'organization');

    if (options.organizationId) {
      query.andWhere('meter.organization_id = :orgId', { orgId: options.organizationId });
    }

    if (options.meterIds?.length) {
      query.andWhere('meter.id IN (:...meterIds)', { meterIds: options.meterIds });
    }

    return query.getMany();
  }

  async create(data: Partial<Meter>): Promise<Meter> {
    const meter = this.repository.create(data);
    return this.repository.save(meter);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
