import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Organizations table
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "role" VARCHAR(20) NOT NULL CHECK ("role" IN ('admin', 'user')),
        "organization_id" UUID REFERENCES "organizations"("id") ON DELETE SET NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    // Meters table
    await queryRunner.query(`
      CREATE TABLE "meters" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    // Meter readings table
    await queryRunner.query(`
      CREATE TABLE "meter_readings" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "meter_id" UUID NOT NULL REFERENCES "meters"("id") ON DELETE CASCADE,
        "timestamp" TIMESTAMP NOT NULL,
        "index_kwh" NUMERIC(15, 4) NOT NULL,
        "consumption_kwh" NUMERIC(15, 4),
        "created_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    // Bonus: User-Meter assignment table (many-to-many)
    await queryRunner.query(`
      CREATE TABLE "user_meters" (
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "meter_id" UUID NOT NULL REFERENCES "meters"("id") ON DELETE CASCADE,
        PRIMARY KEY ("user_id", "meter_id")
      )
    `);

    // Indexes for performance
    await queryRunner.query(`CREATE INDEX "idx_meter_readings_meter_id" ON "meter_readings"("meter_id")`);
    await queryRunner.query(`CREATE INDEX "idx_meter_readings_timestamp" ON "meter_readings"("timestamp")`);
    await queryRunner.query(`CREATE INDEX "idx_meter_readings_meter_timestamp" ON "meter_readings"("meter_id", "timestamp" DESC)`);
    await queryRunner.query(`CREATE INDEX "idx_meters_organization_id" ON "meters"("organization_id")`);
    await queryRunner.query(`CREATE INDEX "idx_users_organization_id" ON "users"("organization_id")`);
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_meters"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meter_readings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meters"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organizations"`);
  }
}
