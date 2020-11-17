import { DeclarationService } from './declaration.service'
import { ScraperModule } from './../scraper/scraper.module'
import { TelegramModule } from './../telegram/telegram.module'
import { Module } from '@nestjs/common'
import { DeclarationController } from './declaration.controller'
import { DataModule } from 'src/data/data.module'

@Module({
  imports: [DataModule, TelegramModule, ScraperModule],
  controllers: [DeclarationController],
  providers: [DeclarationService],
})
export class SubscribersModule {}
