import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/database';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './shared/middlewares/error-handler.middleware';
import { rateLimiter } from './shared/middlewares/rate-limiter.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import organizationRoutes from './modules/organization/organization.routes';
import userRoutes from './modules/user/user.routes';
import meterRoutes from './modules/meter/meter.routes';
import meterReadingRoutes from './modules/meter-reading/meter-reading.routes';
import reportRoutes from './modules/report/report.routes';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/auth', authRoutes);
app.use('/organizations', organizationRoutes);
app.use('/users', userRoutes);
app.use('/meters', meterRoutes);
app.use('/meter-readings', meterReadingRoutes);
app.use('/report', reportRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler (must be last)
app.use(errorHandler);

// Start Server
AppDataSource.initialize()
  .then(() => {
    console.log('📦 Database connected successfully');
    app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
      console.log(`📋 Environment: ${env.nodeEnv}`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

export default app;
