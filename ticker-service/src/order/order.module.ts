import { Module } from '@nestjs/common';
import { Order } from './order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Event } from 'src/event/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Event])], 
  providers: [OrderService],                  
  controllers: [OrderController],            
  exports: [OrderService],
})
export class OrderModule {}
