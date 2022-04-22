import { TimestampEntity } from "src/utils/generics/timestamp.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Profile extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    bio: string

    @Column()
    photo: string
}


