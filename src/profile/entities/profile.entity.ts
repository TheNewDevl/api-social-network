import { User } from "src/user/entities/user.entity";
import { TimestampEntity } from "src/utils/generics/timestamp.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Profile extends TimestampEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToOne(() => User, (user) => user.profile, {

    })
    @JoinColumn()
    user: User

    @Column()
    bio: string

    @Column({
        default: 'https://cdn.pixabay.com/photo/2016/10/18/18/19/question-mark-1750942_960_720.png'
    })
    photo: string
}


