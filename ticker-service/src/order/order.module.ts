import { Module } from '@nestjs/common';
import { Order } from './order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Event } from 'src/event/event.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Event]),

    ClientsModule.register([
      {
        name: String(process.env.RABBIT_SERVICE),
        transport: Transport.RMQ,
        options: {
          urls: [String(process.env.RABBIT_URL)],
          queue: process.env.RABBIT_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
  ], 
  providers: [OrderService],                  
  controllers: [OrderController],            
  exports: [OrderService],
})
export class OrderModule {}
