import { Controller, UseGuards, Req, Get, Inject, Patch, Post, Body, Param, Query, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody,ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/security/JWT/jwt-auth.guard';
import { Roles } from 'src/security/decorators/role.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/security/guard/role.guard';
import { CreateEventRequestDto, CreateOrderResponseDto } from 'dto/ticket.dto';
import { TicketService } from '../ticket/ticket.service';

@Controller('admin')
@ApiTags('Api Admin') 
export class AdminController {
  constructor(
    private ticketService: TicketService
  ) {}

  @Post('create-event')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Tạo event bất kì' })
  @ApiBody({ type: CreateEventRequestDto })
  async createDeTuAdmin(@Body() body: CreateEventRequestDto) {
    return this.ticketService.handleCreateEvent(body);
  }
}