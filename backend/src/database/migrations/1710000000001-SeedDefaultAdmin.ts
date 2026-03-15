import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class SeedDefaultAdmin1710000000001 implements MigrationInterface {
  name = 'SeedDefaultAdmin1710000000001';

  // Seed UUIDs (valid v4 format)
  private readonly ORG_ACME = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  private readonly ORG_GREENTECH = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

  private readonly METER_FLOOR1 = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
  private readonly METER_FLOOR2 = '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';
  private readonly METER_WAREHOUSE = '3c4d5e6f-7a8b-4c9d-ae0f-1a2b3c4d5e6f';
  private readonly METER_OFFICE = '4d5e6f7a-8b9c-4d0e-bf1a-2b3c4d5e6f7a';
  private readonly METER_SERVER = '5e6f7a8b-9c0d-4e1f-8a2b-3c4d5e6f7a8b';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordHash = await bcrypt.hash('admin123', 12);

    await queryRunner.query(
      `INSERT INTO "users" ("email", "password_hash", "role") VALUES ($1, $2, 'admin')`,
      ['admin@example.com', passwordHash]
    );

    await queryRunner.query(
      `INSERT INTO "organizations" ("id", "name") VALUES 
        ('${this.ORG_ACME}', 'Acme Energy Corp'),
        ('${this.ORG_GREENTECH}', 'GreenTech Solutions')`
    );

    await queryRunner.query(
      `INSERT INTO "meters" ("id", "name", "organization_id") VALUES 
        ('${this.METER_FLOOR1}', 'Main Building - Floor 1', '${this.ORG_ACME}'),
        ('${this.METER_FLOOR2}', 'Main Building - Floor 2', '${this.ORG_ACME}'),
        ('${this.METER_WAREHOUSE}', 'Warehouse A', '${this.ORG_ACME}')`
    );

    await queryRunner.query(
      `INSERT INTO "meters" ("id", "name", "organization_id") VALUES 
        ('${this.METER_OFFICE}', 'Office - Main', '${this.ORG_GREENTECH}'),
        ('${this.METER_SERVER}', 'Server Room', '${this.ORG_GREENTECH}')`
    );

    const userPasswordHash = await bcrypt.hash('user123', 12);
    await queryRunner.query(
      `INSERT INTO "users" ("email", "password_hash", "role", "organization_id") VALUES ($1, $2, 'user', '${this.ORG_ACME}')`,
      ['user@acme.com', userPasswordHash]
    );

    const now = new Date();
    const readings = [
      { meterId: this.METER_FLOOR1, hoursAgo: 20, index: 1000, consumption: null },
      { meterId: this.METER_FLOOR1, hoursAgo: 16, index: 1050, consumption: 50 },
      { meterId: this.METER_FLOOR1, hoursAgo: 12, index: 1120, consumption: 70 },
      { meterId: this.METER_FLOOR1, hoursAgo: 8, index: 1180, consumption: 60 },
      { meterId: this.METER_FLOOR1, hoursAgo: 4, index: 1250, consumption: 70 },
      { meterId: this.METER_FLOOR1, hoursAgo: 1, index: 1300, consumption: 50 },
      { meterId: this.METER_FLOOR2, hoursAgo: 18, index: 500, consumption: null },
      { meterId: this.METER_FLOOR2, hoursAgo: 12, index: 530, consumption: 30 },
      { meterId: this.METER_FLOOR2, hoursAgo: 6, index: 570, consumption: 40 },
      { meterId: this.METER_FLOOR2, hoursAgo: 1, index: 600, consumption: 30 },
      { meterId: this.METER_WAREHOUSE, hoursAgo: 22, index: 2000, consumption: null },
      { meterId: this.METER_WAREHOUSE, hoursAgo: 10, index: 2200, consumption: 200 },
      { meterId: this.METER_WAREHOUSE, hoursAgo: 2, index: 2350, consumption: 150 },
      { meterId: this.METER_OFFICE, hoursAgo: 20, index: 800, consumption: null },
      { meterId: this.METER_OFFICE, hoursAgo: 14, index: 845, consumption: 45 },
      { meterId: this.METER_OFFICE, hoursAgo: 8, index: 890, consumption: 45 },
      { meterId: this.METER_OFFICE, hoursAgo: 2, index: 940, consumption: 50 },
      { meterId: this.METER_SERVER, hoursAgo: 23, index: 5000, consumption: null },
      { meterId: this.METER_SERVER, hoursAgo: 16, index: 5350, consumption: 350 },
      { meterId: this.METER_SERVER, hoursAgo: 8, index: 5700, consumption: 350 },
      { meterId: this.METER_SERVER, hoursAgo: 1, index: 6100, consumption: 400 },
    ];

    for (const r of readings) {
      const timestamp = new Date(now.getTime() - r.hoursAgo * 60 * 60 * 1000);
      await queryRunner.query(
        `INSERT INTO "meter_readings" ("meter_id", "timestamp", "index_kwh", "consumption_kwh") VALUES ($1, $2, $3, $4)`,
        [r.meterId, timestamp.toISOString(), r.index, r.consumption]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "meter_readings"`);
    await queryRunner.query(`DELETE FROM "users" WHERE "email" IN ('admin@example.com', 'user@acme.com')`);
    await queryRunner.query(`DELETE FROM "meters"`);
    await queryRunner.query(`DELETE FROM "organizations"`);
  }
}
