import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Meter } from '../meter/meter.entity';

@Entity('meter_readings')
export class MeterReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'meter_id' })
  meterId: string;

  @ManyToOne(() => Meter, (meter) => meter.readings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meter_id' })
  meter: Meter;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'numeric', precision: 15, scale: 4, name: 'index_kwh' })
  indexKwh: number;

  @Column({ type: 'numeric', precision: 15, scale: 4, name: 'consumption_kwh', nullable: true })
  consumptionKwh: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
