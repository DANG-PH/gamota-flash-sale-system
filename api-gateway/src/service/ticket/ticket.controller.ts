import { Controller, Post, Body, UseGuards, Patch, Req, Inject, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody,ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateOrderDto, CreateOrderResponseDto, GetOrderStatusDto, GetOrderStatusResponseDto, GetStockDto, GetStockResponseDto } from 'dto/ticket.dto';
import { TicketService } from './ticket.service';

@Controller('ticket')
@ApiTags('Api Ticket') 
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
  ) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Tạo order mới' })
  @ApiBody({ type: CreateOrderDto })
  async changeRolePartner(@Body() body: CreateOrderDto): Promise<CreateOrderResponseDto> {
    return this.ticketService.handleCreateOrder(body)
  }

  // Kiểm tra trạng thái đơn hàng
  @Get('order-status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái đơn hàng' })
  @ApiQuery({ name: 'order_id', description: 'ID đơn hàng', type: Number, example: 1 })
  async getOrderStatus(@Query() query: GetOrderStatusDto): Promise<GetOrderStatusResponseDto> {
    return this.ticketService.handleGetOrderStatus(query);
  }

  // Lấy số lượng vé còn lại
  @Get('stock')
  @ApiOperation({ summary: 'Lấy số lượng vé còn lại' })
  @ApiQuery({ name: 'event_id', description: 'ID sự kiện', type: Number, example: 1 })
  async getStock(@Query() query: GetStockDto): Promise<GetStockResponseDto> {
    return this.ticketService.handleGetStock(query);
  }
}