import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TicketModule } from 'src/ticket/ticket.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
        transport: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
            },
        },
        defaults: {
            from: `"GAMOTA" <${process.env.MAIL_USER}>`,
        },
    }),
    TicketModule
  ],
  providers: [],
  controllers: [QueueController],
})
export class QueueModule {}