import { Router } from 'express';
import Container from 'typedi';
import { OrganizationController } from './organization.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { authorize } from '../../shared/middlewares/authorization.middleware';
import { validateDto } from '../../shared/middlewares/validate-dto.middleware';
import { CreateOrganizationDto } from './organization.dto';

const router = Router();
const controller = Container.get(OrganizationController);

// All routes require authentication and admin role
router.use(authMiddleware, authorize('admin'));

/**
 * @swagger
 * /organizations:
 *   get:
 *     tags: [Organizations]
 *     summary: List all organizations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations
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
 *                     $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: Forbidden — admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get('/', (req, res, next) => controller.findAll(req, res, next));

/**
 * @swagger
 * /organizations:
 *   post:
 *     tags: [Organizations]
 *     summary: Create a new organization
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 example: Acme Energy Corp
 *     responses:
 *       201:
 *         description: Organization created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin only
 */
router.post('/', validateDto(CreateOrganizationDto), (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /organizations/{id}:
 *   delete:
 *     tags: [Organizations]
 *     summary: Delete an organization
 *     description: Cascades to meters and readings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       404:
 *         description: Organization not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin only
 */
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
