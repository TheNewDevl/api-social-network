import { TimestampEntity } from 'src/utils/generics/timestamp.entity';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import EntityOwnerInterface from 'src/EntityOwnerInterface';

@Entity()
export class Comment extends TimestampEntity implements EntityOwnerInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @Column()
  text: string;

  @Column({ default: 0 })
  lastComment: number;

  getUserId() {
    return this.user;
  }
}
