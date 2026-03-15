import { Service } from "typedi";
import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database";
import { MeterReading } from "./meter-reading.entity";

@Service()
export class MeterReadingRepository {
  private repository: Repository<MeterReading>;

  constructor() {
    this.repository = AppDataSource.getRepository(MeterReading);
  }

  async findLatestByMeterId(meterId: string): Promise<MeterReading | null> {
    return this.repository.findOne({
      where: { meterId },
      order: { timestamp: "DESC" },
    });
  }

  async create(data: Partial<MeterReading>): Promise<MeterReading> {
    const reading = this.repository.create(data);
    return this.repository.save(reading);
  }

  /**
   * Fetch latest reading with row-level lock to prevent race conditions.
   * Must be called within a transaction.
   */
  async findLatestByMeterIdForUpdate(
    meterId: string,
  ): Promise<MeterReading | null> {
    return this.repository
      .createQueryBuilder("reading")
      .where("reading.meter_id = :meterId", { meterId })
      .orderBy("reading.timestamp", "DESC")
      .setLock("pessimistic_write")
      .getOne();
  }

  async findByMeterIdsAndTimeRange(
    meterIds: string[],
    startTime: Date,
    endTime: Date,
  ): Promise<MeterReading[]> {
    return (
      this.repository
        .createQueryBuilder("reading")
        .where("reading.meter_id IN (:...meterIds)", { meterIds })
        .andWhere("reading.timestamp >= :startTime", { startTime })
        //.andWhere('reading.timestamp <= :endTime', { endTime })
        .orderBy("reading.timestamp", "ASC")
        .getMany()
    );
  }
}
