import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Event } from 'src/event/event.entity';
import { Order, OrderStatus } from 'src/order/order.entity';
import { OptimisticLockVersionMismatchError } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { RedisStockService } from 'src/redis/redis-stock.service';
import type { CreateOrderRequest, CreateOrderResponse, GetOrderStatusRequest, GetOrderStatusResponse, InsertOrderRequest, InsertOrderResponse } from '../../proto/ticket.pb';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redisStockService: RedisStockService,
    @Inject(String(process.env.RABBIT_SERVICE)) private readonly queueClient: ClientProxy,
  ) {}

  // Create Order (Pessimistic Lock)
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock event row for write
      const event = await queryRunner.manager.findOne(Event, {
        where: { id: request.event_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) throw new ConflictException('Event not found');

      if (event.remaining_stock < request.quantity) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: 'Not enough tickets',
          order_id: 0,
        };
      }

      // Trừ stock
      event.remaining_stock -= request.quantity;
      await queryRunner.manager.save(event);

      // Tạo order
      const order = new Order();
      order.user_id = request.user_id;
      order.event = event;
      order.quantity = request.quantity;
      order.status = OrderStatus.SUCCESS;

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Order created',
        order_id: savedOrder.id,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  
  async createOrderOptimistic(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    while (true) {
        try {
        // 1. Lấy event
        const event = await this.eventRepo.findOne({ where: { id: request.event_id } });
        if (!event) throw new ConflictException('Event not found');

        // 2. Kiểm tra stock
        if (event.remaining_stock < request.quantity) {
            return {
            success: false,
            message: 'Not enough tickets',
            order_id: 0,
            };
        }

        // 3. Trừ stock
        event.remaining_stock -= request.quantity;

        // 4. Lưu với optimistic lock (sử dụng version)
        const savedEvent = await this.eventRepo.save(event); 
        // Nếu version bị thay đổi bởi transaction khác, TypeORM sẽ throw OptimisticLockVersionMismatchError

        // 5. Tạo order
        const order = this.orderRepo.create({
            user_id: request.user_id,
            event: savedEvent,
            quantity: request.quantity,
            status: OrderStatus.SUCCESS,
        });
        const savedOrder = await this.orderRepo.save(order);

        return {
            success: true,
            message: 'Order created',
            order_id: savedOrder.id,
        };

        } catch (err) {
        if (err instanceof OptimisticLockVersionMismatchError) {
            // Retry nếu có conflict (người khác update trước)
            continue;
        }
        throw err;
        }
    }
  }

  async createOrderRedisLua(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const { event_id, quantity, user_id } = request;

    // 1. Giảm tồn kho ở Redis, atomic Lua script
    const stockResult = await this.redisStockService.decreaseStock(event_id, quantity);

    if (stockResult === -2) {
      return { success: false, message: 'Event stock not initialized', order_id: 0 };
    }

    if (stockResult === -1) {
      return { success: false, message: 'Not enough tickets', order_id: 0 };
    }

    // 2. Redis OK → tạo order trong DB
    try {
      this.queueClient.emit('sync-stock', {
        event_id: event_id,
        quantity: quantity,
        user_id: user_id
      }); 

      return {
        success: true,
        message: 'Order created',
        order_id: 0,
      };

    } catch (err) {
      // 3. lỗi -> rollback stock Redis
      await this.redisStockService.increaseStock(event_id, quantity);

      throw err;
    }
  }

  async getOrderStatus(request: GetOrderStatusRequest): Promise<GetOrderStatusResponse> {
    const order = await this.orderRepo.findOne({ where: { id: request.order_id }, relations: ['event'] });
    if (!order) {
      return { order_id: request.order_id, success: false, status: 'NOT_FOUND' };
    }
    return { order_id: order.id, success: order.status === OrderStatus.SUCCESS, status: order.status };
  }

  async insertOrder(request: InsertOrderRequest): Promise<InsertOrderResponse> {
    const event = await this.eventRepo.findOne({ where: { id: request.event_id } });
    if (!event) {
      return { success: false };
    }

    const order = this.orderRepo.create({
      user_id: request.user_id,
      event: event,
      quantity: request.quantity,
      status: OrderStatus.SUCCESS,
    });

    const savedOrder = await this.orderRepo.save(order);

    return {
      success: true
    }
  }
}
