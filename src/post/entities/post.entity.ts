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
  JoinTable,
} from 'typeorm';

@Entity()
export class Post extends TimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToMany(() => User, (user) => user.likes, { cascade: true })
  @JoinTable()
  likes: User[];
}
