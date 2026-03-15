import { Service } from "typedi";
import { AppDataSource } from "../../config/database";
import { MeterReadingRepository } from "./meter-reading.repository";
import { MeterRepository } from "../meter/meter.repository";
import { MeterReading } from "./meter-reading.entity";
import { CreateMeterReadingDto } from "./meter-reading.dto";
import { NotFoundError, ValidationError } from "../../shared/exceptions";

@Service()
export class MeterReadingService {
  constructor(
    private readonly meterReadingRepository: MeterReadingRepository,
    private readonly meterRepository: MeterRepository,
  ) {}

  async create(dto: CreateMeterReadingDto): Promise<MeterReading> {
    const meter = await this.meterRepository.findById(dto.meterId);

    if (!meter) {
      throw new NotFoundError("Meter not found");
    }

    // Use a transaction with pessimistic locking to prevent race conditions
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      // Get latest reading with row-level lock
      const latestReading = await transactionalEntityManager
        .createQueryBuilder(MeterReading, "reading")
        .where("reading.meter_id = :meterId", { meterId: dto.meterId })
        .orderBy("reading.timestamp", "DESC")
        .setLock("pessimistic_write")
        .getOne();

      let consumptionKwh: number | null = null;

      if (latestReading) {
        const newTimestamp = new Date(dto.timestamp);
        if (newTimestamp <= latestReading.timestamp) {
          throw new ValidationError(
            `Timestamp must be after the latest reading (${latestReading.timestamp.toISOString()})`,
          );
        }

        const previousIndex = Number(latestReading.indexKwh);
        const newIndex = dto.index_kwh;

        // Validate: new reading cannot be lower than previous
        if (newIndex < previousIndex) {
          throw new ValidationError(
            `New index reading (${newIndex}) cannot be lower than previous reading (${previousIndex})`,
          );
        }

        consumptionKwh = newIndex - previousIndex;
      }

      // Create and save the new reading
      const reading = transactionalEntityManager.create(MeterReading, {
        meterId: dto.meterId,
        timestamp: new Date(dto.timestamp),
        indexKwh: dto.index_kwh,
        consumptionKwh,
      });

      return transactionalEntityManager.save(reading);
    });
  }
}
