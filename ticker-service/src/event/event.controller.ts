import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EventService } from './event.service';
import type { CreateOrderRequest, CreateOrderResponse, GetOrderStatusRequest, GetOrderStatusResponse, GetStockRequest, GetStockResponse } from '../../proto/ticket.pb';
import { TICKET_SERVICE_NAME } from '../../proto/ticket.pb';
@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @GrpcMethod(TICKET_SERVICE_NAME, 'GetStock')
  async getStock(data: GetStockRequest): Promise<GetStockResponse> {
    return this.eventService.getStock(data);
  }
}
