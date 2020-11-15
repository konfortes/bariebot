import { Scraper } from './scraper'
import { Module } from '@nestjs/common'

@Module({
  providers: [Scraper],
  exports: [Scraper],
})
export class ScraperModule {}
