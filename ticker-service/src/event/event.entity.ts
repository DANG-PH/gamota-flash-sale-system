import { Entity, PrimaryGeneratedColumn, Column, VersionColumn, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity';

@Entity('event')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  total_stock: number; // tổng vé ban đầu

  @Column({ type: 'int' })
  remaining_stock: number; // vé còn lại

  // @VersionColumn()
  // version: number; // dùng cho optimistic lock

  @OneToMany(() => Order, order => order.event)
  orders: Order[];
}
