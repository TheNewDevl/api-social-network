import { Comment } from "src/comment/entities/comment.entity";
import { TimestampEntity } from "src/generics/timestamp.entity";
import { User } from "src/user/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column } from "typeorm";

@Entity()
export class Post extends TimestampEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => User, (user) => user.posts)
    user: User

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[]

    @Column({ length: 2000 })
    text: string

    @Column({
        nullable: true,
        default: 'https://cdn.pixabay.com/photo/2016/10/18/18/19/question-mark-1750942_960_720.png'
    })
    photo: string
}
