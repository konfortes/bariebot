import { ConfigService } from '@nestjs/config'
import { Controller, Post, Req, UnauthorizedException } from '@nestjs/common'
import { InjectBot, TelegrafProvider } from 'nestjs-telegraf'
import { Logger } from 'src/common/logger'
import { Request } from 'express'
import { UsersStore } from 'src/data/users.store'

@Controller('distribution')
export class DeclarationController {
  // TODO: move forecast outside of commandHandler
  constructor(
    @InjectBot() private bot: TelegrafProvider,
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly usersStore: UsersStore,
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
      await Promise.all(subscribedUsers.map(user => console.log(user)))
    } catch (ex) {
      this.logger.error(`error while sending declaration: ${ex}`)
    }
  }
}
