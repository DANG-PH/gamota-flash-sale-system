import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from 'src/event/event.entity';
import type { CreateEventRequest, CreateEventResponse, GetStockRequest, GetStockResponse, UpdateStockRequest, UpdateStockResponse } from '../../proto/ticket.pb';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getStock(request: GetStockRequest): Promise<GetStockResponse> {
    const event = await this.eventRepo.findOne({ where: { id: request.event_id } });
    if (!event) return { event_id: request.event_id, remaining_stock: 0 };
    return { event_id: event.id, remaining_stock: event.remaining_stock };
  }

  async updateStock(request: UpdateStockRequest): Promise<UpdateStockResponse> {
    const event = await this.eventRepo.findOne({ where: { id: request.event_id } });
    if (!event) {
      return { success: false };
    }
    const stock = request.quantity;
    if (stock !== undefined) {
      event.remaining_stock = stock;
    }

    await this.eventRepo.save(event); 

    return {
      success: true
    }
  }

  async createEvent(request: CreateEventRequest): Promise<CreateEventResponse> {
    const event = this.eventRepo.create({
      name: request.name,
      total_stock: request.stock,
      remaining_stock: request.stock
    })

    await this.eventRepo.save(event);
    await this.cacheManager.set(`event:${event.id}:stock`, request.stock, 0);

    return {
      success: true
    }
  }
}
