import { StatementService } from './statement.service'
import { ScraperModule } from '../scraping/scraper.module'
import { TelegramModule } from './../telegram/telegram.module'
import { Module } from '@nestjs/common'
import { StatementController } from './statement.controller'
import { DataModule } from 'src/data/data.module'

@Module({
  imports: [DataModule, TelegramModule, ScraperModule],
  controllers: [StatementController],
  providers: [StatementService],
})
export class SubscribersModule {}
