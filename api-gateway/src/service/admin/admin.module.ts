import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { JwtStrategy } from 'src/security/JWT/jwt.strategy';
import { RolesGuard } from 'src/security/guard/role.guard';
import { AuthModule } from 'src/service/auth/auth.module';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [AuthModule, TicketModule],
  controllers: [AdminController],
  providers: [JwtStrategy,RolesGuard]
})
export class AdminModule {}
