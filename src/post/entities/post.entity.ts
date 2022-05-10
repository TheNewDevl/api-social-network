import { Comment } from 'src/comments/entities/comment.entity';
import { TimestampEntity } from 'src/utils/generics/timestamp.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
} from 'typeorm';

@Entity()
export class Post extends TimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Column({ length: 2000 })
  text: string;

  @Column({
    nullable: true,
  })
  image: string;
}
