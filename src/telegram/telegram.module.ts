import { ScraperModule } from '../scraping/scraper.module'
import { DataModule } from './../data/data.module'
import { CommandHandler } from './command.handler'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TelegrafModule } from 'nestjs-telegraf/dist/telegraf.module'
import { CommandReceiver } from './command.receiver'
import { InjectBot, TelegrafProvider } from 'nestjs-telegraf'
import { OnApplicationBootstrap } from '@nestjs/common/interfaces/hooks/on-application-bootstrap.interface'
import { AdminNotificationsService } from './admin-notifications.service'

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        token: config.get<string>('telegram.botToken'),
        launchOptions: {
          webhook: {
            domain: config.get<string>('telegram.webhook.domain'),
            hookPath: config.get<string>('telegram.webhook.secretPath'),
          },
        },
      }),
      inject: [ConfigService],
    }),
    DataModule,
    ScraperModule,
  ],
  providers: [CommandReceiver, CommandHandler, AdminNotificationsService],
  exports: [CommandHandler, AdminNotificationsService],
})
export class TelegramModule implements OnApplicationBootstrap {
  constructor(
    private readonly receiver: CommandReceiver,
    @InjectBot() private bot: TelegrafProvider,
  ) {}
  async onApplicationBootstrap() {
    await this.bot.telegram.setMyCommands(this.receiver.supportedCommands)
  }
}
