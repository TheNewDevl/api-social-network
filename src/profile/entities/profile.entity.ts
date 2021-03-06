import EntityOwnerInterface from 'src/pipes/EntityOwnerInterface';
import { User } from 'src/user/entities/user.entity';
import { TimestampEntity } from 'src/utils/generics/timestamp.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Profile extends TimestampEntity implements EntityOwnerInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  bio: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    nullable: true,
  })
  photo: string;

  getUserId() {
    return this.userId;
  }
}
