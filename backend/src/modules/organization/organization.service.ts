import { Service } from 'typedi';
import { OrganizationRepository } from './organization.repository';
import { Organization } from './organization.entity';
import { NotFoundError } from '../../shared/exceptions';
import { CreateOrganizationDto } from './organization.dto';

@Service()
export class OrganizationService {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.findAll();
  }

  async findById(id: string): Promise<Organization> {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }
    return org;
  }

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    return this.organizationRepository.create({ name: dto.name });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.organizationRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Organization not found');
    }
  }
}
