import { Service } from 'typedi';
import { MeterRepository } from './meter.repository';
import { UserRepository } from '../user/user.repository';
import { Meter } from './meter.entity';
import { CreateMeterDto } from './meter.dto';
import { NotFoundError } from '../../shared/exceptions';
import { AppDataSource } from '../../config/database';
import { User } from '../user/user.entity';
import { MeterReading } from '../meter-reading/meter-reading.entity';

@Service()
export class MeterService {
  constructor(
    private readonly meterRepository: MeterRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(): Promise<Meter[]> {
    return this.meterRepository.findAll();
  }

  async findByOrganizationId(organizationId: string): Promise<Meter[]> {
    return this.meterRepository.findByOrganizationId(organizationId);
  }

  async findAccessibleByUser(userId: string, organizationId: string): Promise<Meter[]> {
    const user = await this.userRepository.findByIdWithMeters(userId);

    if (user?.assignedMeters?.length) {
      return this.meterRepository.findByIdsAndOrganization(
        user.assignedMeters.map((m) => m.id),
        organizationId
      );
    }

    return this.meterRepository.findByOrganizationId(organizationId);
  }

  async create(dto: CreateMeterDto): Promise<Meter> {
    return AppDataSource.transaction(async (manager) => {
      const meter = manager.create(Meter, {
        name: dto.name,
        organizationId: dto.organizationId,
      });
      const savedMeter = await manager.save(meter);

      const initialReading = manager.create(MeterReading, {
        meterId: savedMeter.id,
        timestamp: new Date(),
        indexKwh: 0,
        consumptionKwh: 0,
      });
      await manager.save(initialReading);

      const orgUsers = await manager.find(User, {
        where: { organizationId: dto.organizationId },
        relations: ['assignedMeters'],
      });

      for (const user of orgUsers) {
        user.assignedMeters.push(savedMeter);
      }

      if (orgUsers.length) {
        await manager.save(orgUsers);
      }

      return savedMeter;
    });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.meterRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Meter not found');
    }
  }

  async assignToUser(meterId: string, userId: string): Promise<void> {
    const meter = await this.meterRepository.findById(meterId);
    if (!meter) {
      throw new NotFoundError('Meter not found');
    }

    const user = await this.userRepository.findByIdWithMeters(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const alreadyAssigned = user.assignedMeters.some((m) => m.id === meterId);
    if (!alreadyAssigned) {
      user.assignedMeters.push(meter);
      await this.userRepository.save(user);
    }
  }

  async unassignFromUser(meterId: string, userId: string): Promise<void> {
    const user = await this.userRepository.findByIdWithMeters(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.assignedMeters = user.assignedMeters.filter((m) => m.id !== meterId);
    await this.userRepository.save(user);
  }
}
