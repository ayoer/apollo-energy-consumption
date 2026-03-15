import { Router } from 'express';
import Container from 'typedi';
import { MeterReadingController } from './meter-reading.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { validateDto } from '../../shared/middlewares/validate-dto.middleware';
import { CreateMeterReadingDto } from './meter-reading.dto';
import { meterReadingRateLimiter } from '../../shared/middlewares/rate-limiter.middleware';

const router = Router();
const controller = Container.get(MeterReadingController);

/**
 * @swagger
 * /meter-readings:
 *   post:
 *     tags: [Meter Readings]
 *     summary: Submit a new meter reading
 *     description: |
 *       Accepts a meter reading from an IoT device. Consumption is automatically calculated
 *       as the difference between the new index and the previous reading's index.
 *
 *       - First reading for a meter: consumption_kwh = NULL
 *       - If new index < previous index: rejected with 400 (meter cannot go backwards)
 *       - Uses pessimistic locking to prevent race conditions
 *
 *       **Note:** This endpoint does not require authentication as data originates from IoT devices.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meterId, timestamp, index_kwh]
 *             properties:
 *               meterId:
 *                 type: string
 *                 format: uuid
 *                 description: The meter that produced this reading
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-03-10T14:30:00Z"
 *               index_kwh:
 *                 type: number
 *                 minimum: 0
 *                 example: 1250.5
 *                 description: Current meter index value in kWh
 *     responses:
 *       201:
 *         description: Reading created with calculated consumption
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/MeterReading'
 *       400:
 *         description: Validation error or index lower than previous reading
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Meter not found
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/',  
  meterReadingRateLimiter,
  validateDto(CreateMeterReadingDto),
  (req, res, next) => controller.create(req, res, next)
);

export default router;
