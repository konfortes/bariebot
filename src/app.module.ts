import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { TelegramModule } from './telegram/telegram.module';
import { SubscribersModule } from './subscribers/subscribers.module';

@Module({
  imports: [CommonModule, TelegramModule, SubscribersModule],
})
export class AppModule {}
