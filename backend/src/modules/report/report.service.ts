import { Service } from 'typedi';
import { MeterRepository } from '../meter/meter.repository';
import { MeterReadingRepository } from '../meter-reading/meter-reading.repository';
import { UserRepository } from '../user/user.repository';
import { MeterReading } from '../meter-reading/meter-reading.entity';
import { JwtPayload } from '../../shared/middlewares/auth.middleware';

export interface ReportData {
  meterId: string;
  meterName: string;
  organizationId: string;
  organizationName: string;
  readings: {
    id: string;
    timestamp: Date;
    indexKwh: number;
    consumptionKwh: number | null;
  }[];
  totalConsumption: number;
}

@Service()
export class ReportService {
  constructor(
    private readonly meterRepository: MeterRepository,
    private readonly meterReadingRepository: MeterReadingRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getReport(
    currentUser: JwtPayload,
    meterIds?: string[]
  ): Promise<ReportData[]> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const reportFilter: { organizationId?: string; meterIds?: string[] } = {};

    if (currentUser.role === 'user') {
      reportFilter.organizationId = currentUser.organizationId ?? undefined;

      const user = await this.userRepository.findByIdWithMeters(currentUser.userId);
      const assignedMeterIds = user?.assignedMeters?.length
        ? user.assignedMeters.map((m) => m.id)
        : undefined;

      if (assignedMeterIds && meterIds?.length) {
        reportFilter.meterIds = assignedMeterIds.filter((id) => meterIds.includes(id));
      } else if (assignedMeterIds) {
        reportFilter.meterIds = assignedMeterIds;
      } else if (meterIds?.length) {
        reportFilter.meterIds = meterIds;
      }
    } else if (meterIds?.length) {
      reportFilter.meterIds = meterIds;
    }

    const meters = await this.meterRepository.findForReport(reportFilter);

    if (meters.length === 0) {
      return [];
    }

    const meterIdList = meters.map((m) => m.id);
    const readings = await this.meterReadingRepository.findByMeterIdsAndTimeRange(
      meterIdList,
      last24h,
      now,
    );

    const readingsByMeter = new Map<string, MeterReading[]>();
    for (const reading of readings) {
      const existing = readingsByMeter.get(reading.meterId) || [];
      existing.push(reading);
      readingsByMeter.set(reading.meterId, existing);
    }

    return meters.map((meter) => {
      const meterReadings = readingsByMeter.get(meter.id) || [];
      const totalConsumption = meterReadings.reduce(
        (sum, r) => sum + Number(r.consumptionKwh || 0),
        0
      );

      return {
        meterId: meter.id,
        meterName: meter.name,
        organizationId: meter.organizationId,
        organizationName: meter.organization?.name || '',
        readings: meterReadings.map((r) => ({
          id: r.id,
          timestamp: r.timestamp,
          indexKwh: Number(r.indexKwh),
          consumptionKwh: r.consumptionKwh !== null ? Number(r.consumptionKwh) : null,
        })),
        totalConsumption,
      };
    });
  }
}
