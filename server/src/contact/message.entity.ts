import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 200 })
  name: string

  @Column({ type: 'varchar', length: 200 })
  email: string

  @Column('text')
  body: string

  @Column({ type: 'boolean', default: false })
  read: boolean

  @CreateDateColumn()
  createdAt: Date
}
