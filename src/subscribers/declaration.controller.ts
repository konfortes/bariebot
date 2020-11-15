import { Scraper } from './../scraper/scraper'
import { ConfigService } from '@nestjs/config'
import { Controller, Post, Req, UnauthorizedException } from '@nestjs/common'
import { InjectBot, TelegrafProvider } from 'nestjs-telegraf'
import { Logger } from 'src/common/logger'
import { Request } from 'express'
import { UsersStore } from 'src/data/users.store'

@Controller('declaration')
export class DeclarationController {
  constructor(
    @InjectBot() private bot: TelegrafProvider,
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly usersStore: UsersStore,
    private readonly scraper: Scraper,
  ) {}
  @Post()
  async send(@Req() request: Request): Promise<void> {
    // TODO: move to middleware
    const authHeader = request.headers['authorization']

    const apiToken = this.config.get<string>('apiToken')
    if (authHeader != `Basic ${apiToken}`) {
      throw new UnauthorizedException()
    }

    try {
      const subscribedUsers = await this.usersStore.getSubscribedUsers()

      // TODO: send declaration
      await Promise.all(
        subscribedUsers.map(async user => {
          try {
            const url = user.declaration_url
            await this.scraper.declare(url)

            return await this.bot.telegram.sendMessage(
              user.external_id,
              'שלחתי לך את הצהרת הבריאות!',
            )
          } catch (ex) {
            await this.bot.telegram.sendMessage(
              user.external_id,
              'לא הצלחתי לשלוח את הצהרת הבריאות שלך היום.',
            )
            // TODO: master notification
            return ex
          }
        }),
      )
    } catch (ex) {
      this.logger.error(`error while sending declaration: ${ex}`)
      // TODO: master notify
    }
  }
}
