import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from 'src/event/event.entity';
import type { GetStockRequest, GetStockResponse } from '../../proto/ticket.pb';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  async getStock(request: GetStockRequest): Promise<GetStockResponse> {
    const event = await this.eventRepo.findOne({ where: { id: request.event_id } });
    if (!event) return { event_id: request.event_id, remaining_stock: 0 };
    return { event_id: event.id, remaining_stock: event.remaining_stock };
  }
}
