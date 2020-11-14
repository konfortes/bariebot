import { TelegramModule } from './../telegram/telegram.module'
import { Module } from '@nestjs/common'
import { DeclarationController } from './declaration.controller'
import { DataModule } from 'src/data/data.module'

@Module({
  imports: [DataModule, TelegramModule],
  controllers: [DeclarationController],
})
export class SubscribersModule {}
