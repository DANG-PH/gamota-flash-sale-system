import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { TICKET_PACKAGE_NAME } from 'proto/ticket.pb';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: TICKET_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: TICKET_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/ticket.proto'),
          url: process.env.TICKET_URL,
          loader: {
            keepCase: true,
            objects: true,
            arrays: true,
          },
        },
      },
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService]
})
export class TicketModule {}
