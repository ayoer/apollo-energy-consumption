import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Organization } from '../organization/organization.entity';
import { MeterReading } from '../meter-reading/meter-reading.entity';
import { User } from '../user/user.entity';

@Entity('meters')
export class Meter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.meters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => MeterReading, (reading) => reading.meter)
  readings: MeterReading[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Bonus: Meter-level access control
  @ManyToMany(() => User, (user) => user.assignedMeters)
  assignedUsers: User[];
}
