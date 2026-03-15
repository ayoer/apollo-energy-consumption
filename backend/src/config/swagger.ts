import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Apollo Energy Monitoring Platform API',
      version: '1.0.0',
      description: 'Energy consumption monitoring API for enterprise customers. Organizations can have multiple users and energy meters.',
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiSuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: { type: 'object' },
          },
        },
        ApiMessageResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string' },
          },
        },
        ApiErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
          },
        },
        Organization: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'user'] },
            organizationId: { type: 'string', format: 'uuid', nullable: true },
            organization: { $ref: '#/components/schemas/Organization' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Meter: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            organizationId: { type: 'string', format: 'uuid' },
            organization: { $ref: '#/components/schemas/Organization' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        MeterReading: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            meterId: { type: 'string', format: 'uuid' },
            timestamp: { type: 'string', format: 'date-time' },
            indexKwh: { type: 'number', example: 1250.5 },
            consumptionKwh: { type: 'number', nullable: true, example: 50.3 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ReportData: {
          type: 'object',
          properties: {
            meterId: { type: 'string', format: 'uuid' },
            meterName: { type: 'string' },
            organizationId: { type: 'string', format: 'uuid' },
            organizationName: { type: 'string' },
            readings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  timestamp: { type: 'string', format: 'date-time' },
                  indexKwh: { type: 'number' },
                  consumptionKwh: { type: 'number', nullable: true },
                },
              },
            },
            totalConsumption: { type: 'number' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
