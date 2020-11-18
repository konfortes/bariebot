import { AdminNotificationsService } from './../telegram/admin-notifications.service'
import { Scraper } from './../scraper/scraper'
import { UsersStore } from './../data/users.store'
import { Injectable } from '@nestjs/common'
import { Logger } from 'src/common/logger'
import { InjectBot, TelegrafProvider } from 'nestjs-telegraf'

@Injectable()
export class DeclarationService {
  constructor(
    private readonly logger: Logger,
    private readonly usersStore: UsersStore,
    private readonly scraper: Scraper,
    @InjectBot() private bot: TelegrafProvider,
    private readonly adminNotification: AdminNotificationsService,
  ) {}
  async send() {
    if (new Date().getDay() > 4) {
      this.logger.log('not a week day. skipping')
      return
    }

    try {
      const subscribedUsers = await this.usersStore.getSubscribedUsers()

      // TODO: had some trouble running it in parallel on Heroku, that's why I changed it to run each user synchronously
      for (const user of subscribedUsers) {
        try {
          await this.scraper.declare(user.declaration_url)

          await this.bot.telegram.sendMessage(
            user.external_id,
            'שלחתי לך את הצהרת הבריאות!',
          )
        } catch (ex) {
          await this.adminNotification.notify(
            `could not send declaration for user(${user.external_id} - ${user.first_name}) ${user.last_name}`,
          )
          await this.bot.telegram.sendMessage(
            user.external_id,
            'לא הצלחתי לשלוח את הצהרת הבריאות שלך היום.',
          )
        }
      }
    } catch (ex) {
      this.logger.error(`error while sending declaration: ${ex}`)
      await this.adminNotification.notify(
        `error sending health declarations: ${ex}`,
      )
    }
  }
}
