import { CreateDateColumn, DeleteDateColumn, Timestamp, UpdateDateColumn } from "typeorm";

export class TimestampEntity {

    @CreateDateColumn({
        update: false
    })
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date
}