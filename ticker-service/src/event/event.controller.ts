import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EventService } from './event.service';
import type { CreateEventRequest, CreateEventResponse, CreateOrderRequest, CreateOrderResponse, GetOrderStatusRequest, GetOrderStatusResponse, GetStockRequest, GetStockResponse, UpdateStockRequest, UpdateStockResponse } from '../../proto/ticket.pb';
import { TICKET_SERVICE_NAME } from '../../proto/ticket.pb';
@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @GrpcMethod(TICKET_SERVICE_NAME, 'CreateEvent')
  async createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    return this.eventService.createEvent(data);
  }

  @GrpcMethod(TICKET_SERVICE_NAME, 'GetStock')
  async getStock(data: GetStockRequest): Promise<GetStockResponse> {
    return this.eventService.getStock(data);
  }

  @GrpcMethod(TICKET_SERVICE_NAME, 'UpdateStock')
  async updateStock(data: UpdateStockRequest): Promise<UpdateStockResponse> {
    return this.eventService.updateStock(data);
  }
}
