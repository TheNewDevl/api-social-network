import { Comment } from 'src/comments/entities/comment.entity';
import { TimestampEntity } from 'src/utils/generics/timestamp.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import EntityOwnerInterface from 'src/pipes/EntityOwnerInterface';

@Entity()
export class Post extends TimestampEntity implements EntityOwnerInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Column({ length: 2000 })
  text: string;

  @Column({
    nullable: true,
  })
  image: string;

  @ManyToMany(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  likes: User[];

  commentsCount: number;

  getUserId() {
    return this.userId;
  }
}
