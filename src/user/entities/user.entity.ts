import { Comment } from 'src/comments/entities/comment.entity';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';
import { TimestampEntity } from 'src/utils/generics/timestamp.entity';
import { Post } from 'src/post/entities/post.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import EntityOwnerInterface from 'src/pipes/EntityOwnerInterface';
import { Exclude } from 'class-transformer';

@Entity()
export class User extends TimestampEntity implements EntityOwnerInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'simple-enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.USER,
  })
  roles: UserRoleEnum;

  @Column({ default: 0 })
  hasProfile: number;

  @ManyToMany(() => Post, (post) => post.likes)
  @JoinTable()
  likes: Post[];

  @Column({ nullable: true })
  @Exclude()
  hashedRefreshToken: string;

  getUserId() {
    return this.id;
  }
}
