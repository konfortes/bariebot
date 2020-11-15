import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectBot, TelegrafProvider } from 'nestjs-telegraf'

@Injectable()
export class AdminNotificationsService {
  constructor(
    @InjectBot() private bot: TelegrafProvider,
    private readonly config: ConfigService,
  ) {}
  async notify(msg) {
    // TODO: inject this value instead?
    const adminChatId = this.config.get<string>('telegram.adminChatId')

    return await this.bot.telegram.sendMessage(adminChatId, msg)
  }
}
