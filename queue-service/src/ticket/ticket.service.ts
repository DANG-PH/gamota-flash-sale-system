import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type {
  UpdateStockRequest,
  UpdateStockResponse,
  InsertOrderRequest,
  InsertOrderResponse
} from 'proto/ticket.pb';
import { TICKET_PACKAGE_NAME, TICKET_SERVICE_NAME, TicketServiceClient } from 'proto/ticket.pb';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TicketService {
  private ticketGrpcService: TicketServiceClient;

  constructor(
    @Inject(TICKET_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.ticketGrpcService = this.client.getService<TicketServiceClient>(TICKET_SERVICE_NAME);
  }

  async handleUpdateStock(req: UpdateStockRequest): Promise<UpdateStockResponse> {
    return firstValueFrom(this.ticketGrpcService.updateStock(req));
  }

  async handleInsertOrder(req: InsertOrderRequest): Promise<InsertOrderResponse> {
    return firstValueFrom(this.ticketGrpcService.insertOrder(req));
  }
}
