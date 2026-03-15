import * as path from 'path';
import { DataSource } from 'typeorm';
import { env } from './env';
import { Organization } from '../modules/organization/organization.entity';
import { User } from '../modules/user/user.entity';
import { Meter } from '../modules/meter/meter.entity';
import { MeterReading } from '../modules/meter-reading/meter-reading.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.name,
  synchronize: false,
  logging: env.nodeEnv === 'development',
  entities: [Organization, User, Meter, MeterReading],
  migrations: [path.join(__dirname, '../database/migrations/*{.ts,.js}')],
  subscribers: [],
});
