import { Router } from 'express';
import Container from 'typedi';
import { MeterController } from './meter.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { authorize } from '../../shared/middlewares/authorization.middleware';
import { validateDto } from '../../shared/middlewares/validate-dto.middleware';
import { CreateMeterDto } from './meter.dto';

const router = Router();
const controller = Container.get(MeterController);

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /meters:
 *   get:
 *     tags: [Meters]
 *     summary: List meters
 *     description: Admin sees all meters, users see only their organization's meters (filtered by assignment if applicable)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of meters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Meter'
 *       401:
 *         description: Unauthorized
 */
router.get('/', (req, res, next) => controller.findAll(req, res, next));

/**
 * @swagger
 * /meters:
 *   post:
 *     tags: [Meters]
 *     summary: Create a new meter
 *     description: Creates a meter and an initial reading (0 kWh)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, organizationId]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 example: Building A - Floor 1
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Meter created with initial reading
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Meter'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin only
 */
router.post('/', authorize('admin'), validateDto(CreateMeterDto), (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /meters/{id}:
 *   delete:
 *     tags: [Meters]
 *     summary: Delete a meter
 *     description: Cascades to all readings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Meter ID
 *     responses:
 *       200:
 *         description: Meter deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       404:
 *         description: Meter not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin only
 */
router.delete('/:id', authorize('admin'), (req, res, next) => controller.delete(req, res, next));

/**
 * @swagger
 * /meters/{meterId}/assign/{userId}:
 *   post:
 *     tags: [Meters]
 *     summary: Assign meter to user
 *     description: Grants a user access to a specific meter (meter-level access control)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meterId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Meter assigned to user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin only
 *       404:
 *         description: Meter or user not found
 */
router.post('/:meterId/assign/:userId', authorize('admin'), (req, res, next) => controller.assignToUser(req, res, next));

/**
 * @swagger
 * /meters/{meterId}/unassign/{userId}:
 *   delete:
 *     tags: [Meters]
 *     summary: Unassign meter from user
 *     description: Revokes a user's access to a specific meter
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meterId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Meter unassigned from user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin only
 */
router.delete('/:meterId/unassign/:userId', authorize('admin'), (req, res, next) => controller.unassignFromUser(req, res, next));

export default router;
