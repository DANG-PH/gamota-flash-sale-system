import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { TicketService } from 'src/ticket/ticket.service';
import { MailerService } from '@nestjs-modules/mailer';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Controller()
export class QueueController {
  private readonly logger = new Logger(QueueController.name);

  constructor(
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly ticketService: TicketService,
  ) {}

  @EventPattern('sync-stock')
  async handleSyncStock(@Payload() data: any) {
    console.log(data)
    const { event_id, user_id, quantity } = data;

    // Saga state
    let step1 = false;
    let step2 = false;

    // Retry config
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.ticketService.handleInsertOrder({
          event_id,
          user_id,
          quantity,
        });

        step1 = true;
        break;
      } catch (e) {
        this.logger.error(
          `Step1(createOrder) failed attempt=${attempt} event=${event_id}`,
        );
        console.error(e);
        if (attempt === maxAttempts) return;  
        await sleep(2000);
      }
    }

    if (!step1) return;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const stock = await this.cacheManager.get<number>(`event:${event_id}:stock`);
        if (stock === undefined) {
          this.logger.error(`Redis stock not found for event ${event_id}`);
          return;
        }

        await this.ticketService.handleUpdateStock({
          event_id,
          quantity: stock,
        });

        step2 = true;
        break;
      } catch (e) {
        this.logger.error(
          `Step2(updateStock) failed attempt=${attempt} event=${event_id}`,
        );
        if (attempt === maxAttempts) return; 
        await sleep(2000);
      }
    }

    if (step1 && step2) {
      this.logger.log(
        `Saga success for event=${event_id}, user=${user_id}, qty=${quantity}`,
      );
    }
  }

  @EventPattern('send_email')
  async handleSendEmail(@Payload() data: { to: string; subject: string; html: string }) {
    console.log('Nhận email:', data.to);
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
      try {
        await this.mailerService.sendMail(data);
        console.log('✅ Email gửi thành công:', data.to);
        break;
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.log('❌ Email gửi thất bại:', data.to);
          break;
        }
        console.log(`⚠️ Lỗi gửi email ${data.to}, thử lại lần ${attempts} sau 5s`);
        await sleep(5000);; // delay 5s
      }
    }
  }
}
