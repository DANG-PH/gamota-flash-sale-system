import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './order.service';
import type { CreateOrderRequest, CreateOrderResponse, GetOrderStatusRequest, GetOrderStatusResponse, GetStockRequest, GetStockResponse } from '../../proto/ticket.pb';
import { TICKET_SERVICE_NAME } from '../../proto/ticket.pb';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod(TICKET_SERVICE_NAME, 'CreateOrder')
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    return this.orderService.createOrderRedisLua(data);
  }

  @GrpcMethod(TICKET_SERVICE_NAME, 'GetOrderStatus')
  async getOrderStatus(data: GetOrderStatusRequest): Promise<GetOrderStatusResponse> {
    return this.orderService.getOrderStatus(data);
  }
}
