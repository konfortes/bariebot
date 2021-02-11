import { Module } from '@nestjs/common'
import { CommonModule } from './common/common.module'
import { TelegramModule } from './telegram/telegram.module'
import { SubscribersModule } from './subscribers/subscribers.module'
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [CommonModule, TelegramModule, SubscribersModule, AdminModule],
})
export class AppModule {}
