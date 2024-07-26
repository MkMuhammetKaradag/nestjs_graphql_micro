import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column('text', { array: true, default: ['user'] }) // Varsayılan rol 'user'
  roles: string[];

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;
}
