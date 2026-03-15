import { Router } from 'express';
import Container from 'typedi';
import { ReportController } from './report.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();
const controller = Container.get(ReportController);

/**
 * @swagger
 * /report:
 *   get:
 *     tags: [Reports]
 *     summary: Get energy consumption report
 *     description: |
 *       Returns energy consumption data per meter for the last 24 hours.
 *
 *       - **Admin:** Sees all organizations' data
 *       - **User:** Only sees their own organization's data, filtered by assigned meters if applicable
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: meterIds
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated meter IDs to filter by
 *         example: "uuid1,uuid2"
 *     responses:
 *       200:
 *         description: Report data
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
 *                     $ref: '#/components/schemas/ReportData'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, (req, res, next) => controller.getReport(req, res, next));

export default router;
