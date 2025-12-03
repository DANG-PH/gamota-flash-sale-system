import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrderStatusRequest,
  GetOrderStatusResponse,
  GetStockRequest,
  GetStockResponse
} from 'proto/ticket.pb';
import { TICKET_PACKAGE_NAME, TICKET_SERVICE_NAME, TicketServiceClient } from 'proto/ticket.pb';
import { grpcCall } from 'src/HttpparseException/gRPC_to_Http';

@Injectable()
export class TicketService {
  private ticketGrpcService: TicketServiceClient;

  constructor(
    @Inject(TICKET_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.ticketGrpcService = this.client.getService<TicketServiceClient>(TICKET_SERVICE_NAME);
  }

  async handleCreateOrder(req: CreateOrderRequest): Promise<CreateOrderResponse> {
    return grpcCall(this.ticketGrpcService.createOrder(req));
  }

  async handleGetOrderStatus(req: GetOrderStatusRequest): Promise<GetOrderStatusResponse> {
    return grpcCall(this.ticketGrpcService.getOrderStatus(req));
  }

  async handleGetStock(req: GetStockRequest): Promise<GetStockResponse> {
    return grpcCall(this.ticketGrpcService.getStock(req));
  }
}
