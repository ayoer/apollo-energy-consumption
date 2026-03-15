import 'reflect-metadata';
import { MeterService } from '../modules/meter/meter.service';
import { MeterRepository } from '../modules/meter/meter.repository';
import { UserRepository } from '../modules/user/user.repository';
import { AppError } from '../shared/exceptions';

const mockManager = {
  create: jest.fn().mockImplementation((_entity, data) => ({ id: 'new-uuid', ...data })),
  save: jest.fn().mockImplementation((data) => Promise.resolve(Array.isArray(data) ? data : data)),
  find: jest.fn(),
};

jest.mock('../config/database', () => ({
  AppDataSource: {
    transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
  },
}));

describe('MeterService', () => {
  let service: MeterService;
  let mockMeterRepository: jest.Mocked<Pick<MeterRepository, 'findAll' | 'findById' | 'delete' | 'findByOrganizationId' | 'findByIdsAndOrganization'>>;
  const mockUserRepository = {
    findByIdWithMeters: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    mockMeterRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findByOrganizationId: jest.fn(),
      findByIdsAndOrganization: jest.fn(),
    };
    service = new MeterService(
      mockMeterRepository as unknown as MeterRepository,
      mockUserRepository as unknown as UserRepository,
    );
    jest.clearAllMocks();
  });

  describe('create', () => {
    const meterDto = { name: 'Building A', organizationId: 'org-uuid-1' };

    it('should create meter and initial reading (0 kWh)', async () => {
      mockManager.find.mockResolvedValue([]);

      await service.create(meterDto);

      expect(mockManager.create).toHaveBeenCalledTimes(2);

      const meterCreateCall = mockManager.create.mock.calls[0];
      expect(meterCreateCall[1]).toMatchObject({
        name: 'Building A',
        organizationId: 'org-uuid-1',
      });

      const readingCreateCall = mockManager.create.mock.calls[1];
      expect(readingCreateCall[1]).toMatchObject({
        indexKwh: 0,
        consumptionKwh: 0,
      });
    });

    it('should auto-assign new meter to all organization users', async () => {
      const orgUsers = [
        { id: 'user-1', organizationId: 'org-uuid-1', assignedMeters: [] },
        { id: 'user-2', organizationId: 'org-uuid-1', assignedMeters: [] },
      ];
      mockManager.find.mockResolvedValue(orgUsers);

      await service.create(meterDto);

      expect(mockManager.find).toHaveBeenCalled();
      expect(orgUsers[0].assignedMeters).toHaveLength(1);
      expect(orgUsers[1].assignedMeters).toHaveLength(1);
      expect(mockManager.save).toHaveBeenCalledWith(orgUsers);
    });

    it('should handle creating meter when no users in organization', async () => {
      mockManager.find.mockResolvedValue([]);

      const result = await service.create(meterDto);

      expect(result).toBeDefined();
      // 2 saves: meter + initial reading (no user save since no users)
      expect(mockManager.save).toHaveBeenCalledTimes(2);
    });

    it('should append to existing user meter assignments', async () => {
      const existingMeter = { id: 'existing-meter', name: 'Old Meter' };
      const orgUsers = [
        { id: 'user-1', assignedMeters: [existingMeter] },
      ];
      mockManager.find.mockResolvedValue(orgUsers);

      await service.create(meterDto);

      expect(orgUsers[0].assignedMeters).toHaveLength(2);
      expect(orgUsers[0].assignedMeters[0]).toBe(existingMeter);
    });
  });

  describe('delete', () => {
    it('should delete meter successfully', async () => {
      mockMeterRepository.delete.mockResolvedValue(true);

      await expect(service.delete('meter-1')).resolves.toBeUndefined();
    });

    it('should throw 404 when meter does not exist', async () => {
      mockMeterRepository.delete.mockResolvedValue(false);

      try {
        await service.delete('non-existent');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });

  describe('assignToUser', () => {
    it('should throw 404 when meter does not exist', async () => {
      mockMeterRepository.findById.mockResolvedValue(null);

      try {
        await service.assignToUser('bad-meter', 'user-1');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
        expect((error as AppError).message).toBe('Meter not found');
      }
    });
  });
});
