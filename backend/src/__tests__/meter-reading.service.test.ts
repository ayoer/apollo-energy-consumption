import 'reflect-metadata';
import { MeterReadingService } from '../modules/meter-reading/meter-reading.service';
import { MeterReadingRepository } from '../modules/meter-reading/meter-reading.repository';
import { MeterRepository } from '../modules/meter/meter.repository';
import { AppError } from '../shared/exceptions';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  setLock: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

const mockTransactionalManager = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  create: jest.fn().mockImplementation((_entity, data) => data),
  save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'reading-uuid', ...data })),
};

jest.mock('../config/database', () => ({
  AppDataSource: {
    transaction: jest.fn().mockImplementation((cb) => cb(mockTransactionalManager)),
  },
}));

describe('MeterReadingService', () => {
  let service: MeterReadingService;
  const mockReadingRepository = {} as MeterReadingRepository;
  const mockMeterRepository = {
    findById: jest.fn(),
  };

  const previousTimestamp = new Date('2025-03-10T12:00:00Z');

  beforeEach(() => {
    service = new MeterReadingService(
      mockReadingRepository,
      mockMeterRepository as unknown as MeterRepository,
    );
    jest.clearAllMocks();
  });

  const baseDto = {
    meterId: 'meter-uuid-1',
    timestamp: '2025-03-10T14:00:00Z',
    index_kwh: 1000,
  };

  describe('create', () => {
    it('should throw 404 when meter does not exist', async () => {
      mockMeterRepository.findById.mockResolvedValue(null);

      try {
        await service.create(baseDto);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
        expect((error as AppError).message).toBe('Meter not found');
      }
    });

    it('should create first reading with null consumption', async () => {
      mockMeterRepository.findById.mockResolvedValue({ id: 'meter-uuid-1' });
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.create(baseDto);

      expect(result.meterId).toBe('meter-uuid-1');
      expect(result.indexKwh).toBe(1000);
      expect(result.consumptionKwh).toBeNull();
      expect(mockTransactionalManager.save).toHaveBeenCalled();
    });

    it('should calculate consumption correctly from previous reading', async () => {
      mockMeterRepository.findById.mockResolvedValue({ id: 'meter-uuid-1' });
      mockQueryBuilder.getOne.mockResolvedValue({ indexKwh: 800, timestamp: previousTimestamp });

      const result = await service.create({ ...baseDto, index_kwh: 1000 });

      expect(result.consumptionKwh).toBe(200);
    });

    it('should handle zero consumption (same index)', async () => {
      mockMeterRepository.findById.mockResolvedValue({ id: 'meter-uuid-1' });
      mockQueryBuilder.getOne.mockResolvedValue({ indexKwh: 1000, timestamp: previousTimestamp });

      const result = await service.create({ ...baseDto, index_kwh: 1000 });

      expect(result.consumptionKwh).toBe(0);
    });

    it('should reject reading when new index is lower than previous (400)', async () => {
      mockMeterRepository.findById.mockResolvedValue({ id: 'meter-uuid-1' });
      mockQueryBuilder.getOne.mockResolvedValue({ indexKwh: 1500, timestamp: previousTimestamp });

      try {
        await service.create({ ...baseDto, index_kwh: 1000 });
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toMatch(/cannot be lower than previous reading/);
      }
    });

    it('should reject reading when timestamp is before latest (400)', async () => {
      mockMeterRepository.findById.mockResolvedValue({ id: 'meter-uuid-1' });
      mockQueryBuilder.getOne.mockResolvedValue({
        indexKwh: 800,
        timestamp: new Date('2025-03-10T15:00:00Z'),
      });

      try {
        await service.create({ ...baseDto, timestamp: '2025-03-10T14:00:00Z', index_kwh: 1000 });
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toMatch(/Timestamp must be after/);
      }
    });

    it('should reject reading when timestamp equals latest (400)', async () => {
      mockMeterRepository.findById.mockResolvedValue({ id: 'meter-uuid-1' });
      mockQueryBuilder.getOne.mockResolvedValue({
        indexKwh: 800,
        timestamp: new Date('2025-03-10T14:00:00Z'),
      });

      try {
        await service.create({ ...baseDto, timestamp: '2025-03-10T14:00:00Z', index_kwh: 1000 });
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toMatch(/Timestamp must be after/);
      }
    });

    it('should use pessimistic locking for race condition protection', async () => {
      mockMeterRepository.findById.mockResolvedValue({ id: 'meter-uuid-1' });
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await service.create(baseDto);

      expect(mockQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    });

    it('should handle decimal precision in consumption calculation', async () => {
      mockMeterRepository.findById.mockResolvedValue({ id: 'meter-uuid-1' });
      mockQueryBuilder.getOne.mockResolvedValue({ indexKwh: 1000.5, timestamp: previousTimestamp });

      const result = await service.create({ ...baseDto, index_kwh: 1050.75 });

      expect(result.consumptionKwh).toBeCloseTo(50.25, 4);
    });
  });
});
