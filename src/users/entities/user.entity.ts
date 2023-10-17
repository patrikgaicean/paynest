import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id?: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
