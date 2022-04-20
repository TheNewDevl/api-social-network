import { Comment } from "src/comment/entities/comment.entity";
import { TimestampEntity } from "src/generics/timestamp.entity";
import { Post } from "src/post/entities/post.entity";
import { Profile } from "src/profile/entities/profile.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique('unique_mail_and_username', ['email', 'username'])
export class User extends TimestampEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToOne(() => Profile)
    @JoinColumn()
    profile: Profile

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[]

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[]

    @Column()
    email: string

    @Column()
    password: string

    @Column()
    username: string

    @Column({ default: false })
    isAdmin: boolean
} 