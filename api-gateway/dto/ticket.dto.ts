// ticket.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID người dùng', example: 123 })
  @IsInt()
  user_id: number;

  @ApiProperty({ description: 'ID sự kiện', example: 1 })
  @IsInt()
  event_id: number;

  @ApiProperty({ description: 'Số lượng vé muốn mua', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderResponseDto {
  @ApiProperty({ description: 'Đặt vé thành công hay không', example: true })
  success: boolean;

  @ApiProperty({ description: 'Thông báo kết quả', example: 'Order created' })
  message: string;

  @ApiProperty({ description: 'ID đơn hàng (chỉ khi success=true)', example: 1001 })
  order_id: number;
}

export class GetOrderStatusDto {
  @ApiProperty({ description: 'ID đơn hàng', example: 1001 })
  @Type(() => Number)
  @IsInt()
  order_id: number;
}

export class GetOrderStatusResponseDto {
  @ApiProperty({ description: 'ID đơn hàng', example: 1001 })
  order_id: number;

  @ApiProperty({ description: 'Đặt thành công hay không', example: true })
  success: boolean;

  @ApiProperty({ description: 'Trạng thái đơn hàng', example: 'SUCCESS' })
  status: string;
}

export class GetStockDto {
  @ApiProperty({ description: 'ID sự kiện', example: 1 })
  @Type(() => Number)
  @IsInt()
  event_id: number;
}

export class GetStockResponseDto {
  @ApiProperty({ description: 'ID sự kiện', example: 1 })
  event_id: number;

  @ApiProperty({ description: 'Số lượng vé còn lại', example: 42 })
  remaining_stock: number;
}
