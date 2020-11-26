import { LinksRepository } from './../data/links.repository'
import { AdminNotificationsService } from './../telegram/admin-notifications.service'
import { Scraper } from './../scraper/scraper'
import { UsersRepository } from '../data/users.repository'
import { Injectable } from '@nestjs/common'
import { Logger } from 'src/common/logger'
import { InjectBot, TelegrafProvider } from 'nestjs-telegraf'

@Injectable()
export class DeclarationService {
  constructor(
    private readonly logger: Logger,
    private readonly usersRepo: UsersRepository,
    private readonly linksRepo: LinksRepository,
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
      // TODO: join links to avoid n+1 queries
      const subscribedUsers = await this.usersRepo.getSubscribedUsers()

      // TODO: had some trouble running it in parallel on Heroku, that's why I changed it to run each user synchronously
      for (const user of subscribedUsers) {
        try {
          const link = await this.linksRepo.getByUserId(user.id)

          const approvalUrl = await this.scraper.sendDeclaration(link.value)

          if (process.env.MUTE_NOTIFICATIONS == 'true') {
            this.logger.warn('Notifications are muted')
            return
          }

          const msg =
            'שלחתי את הצהרת הבריאות של ' +
            link.name +
            '. ' +
            'הנה האישור:' +
            approvalUrl
          await this.bot.telegram.sendMessage(user.external_id, msg)
        } catch (ex) {
          await this.adminNotification.notify(
            `could not send declaration for user(${user.external_id} - ${
              user.first_name
            } ${user.last_name ? user.last_name : ''})`,
          )

          if (process.env.MUTE_NOTIFICATIONS == 'true') {
            this.logger.warn('Notifications are muted')
            return
          }

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
