import { LinksRepository } from '../data/links.repository'
import { AdminNotificationsService } from '../telegram/admin-notifications.service'
import { Scraper } from '../scraping/scraper'
import { UsersRepository } from '../data/users.repository'
import { Inject, Injectable } from '@nestjs/common'
import { Logger } from 'winston'
import { InjectBot, TelegrafProvider } from 'nestjs-telegraf'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { UserEntity } from 'src/data/entities/user.entity'
import { NR_AGENT } from 'src/consts'

@Injectable()
export class StatementService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly usersRepo: UsersRepository,
    private readonly linksRepo: LinksRepository,
    private readonly scraper: Scraper,
    @InjectBot() private bot: TelegrafProvider,
    private readonly adminNotification: AdminNotificationsService,
    @Inject(NR_AGENT) private metricsAgent,
  ) {
    this.logger = logger.child({ loggerName: StatementService.name })
  }

  async send() {
    if (!this.isSchoolDay()) {
      this.logger.info('not a school day. skipping')
      return
    }

    try {
      // TODO: join links to avoid n+1 queries
      const subscribedUsers = await this.usersRepo.getSubscribedUsers()

      // TODO: had some trouble running it in parallel on Heroku, something with concurrent connections limitation, that's why I changed it to run each user synchronously
      for (const user of subscribedUsers) {
        try {
          const link = await this.linksRepo.getByUserId(user.id)

          const statementApprovalUrl = await this.scraper.sendHealthStatement(
            link.value,
          )

          await this.handleStatementSuccess(
            link.name,
            statementApprovalUrl,
            user.external_id,
          )
        } catch (ex) {
          await this.handleHealthStatementFailure(user, ex)
        }
      }
    } catch (ex) {
      this.logger.error(`error while sending declarations: ${ex}`)
      await this.adminNotification.notify(
        `error sending health declarations: ${ex}`,
      )
    }
  }

  private isSchoolDay() {
    let schoolDay = true

    if (new Date().getDay() > 4) {
      schoolDay = false
    }

    return schoolDay
  }

  private async handleStatementSuccess(
    linkName: string,
    approvalUrl: string,
    userExternalId: number,
  ): Promise<void> {
    const msg = this.statementApprovalMessage(linkName, approvalUrl)

    await this.sendTelegramMessage(userExternalId, msg)

    await this.metricsAgent.incrementMetric('statement_sent_succeeded')
  }

  private statementApprovalMessage(name: string, approvalUrl: string): string {
    const msg =
      'שלחתי את הצהרת הבריאות של ' + name + '. ' + 'הנה האישור:' + approvalUrl
    return msg
  }

  private async sendTelegramMessage(
    userId: number | string,
    text: string,
  ): Promise<void> {
    if (process.env.MUTE_NOTIFICATIONS == 'true') {
      this.logger.warn('Notifications are muted')
      return
    }

    await this.bot.telegram.sendMessage(userId, text)

    return
  }

  private async handleHealthStatementFailure(
    user: UserEntity,
    ex: Error,
  ): Promise<void> {
    await this.adminNotification.notify(
      `could not send health statement for user(${user.external_id} - ${
        user.first_name
      } ${user.last_name ? user.last_name : ''}). ${ex}`,
    )

    await this.sendTelegramMessage(
      user.external_id,
      'לא הצלחתי לשלוח את הצהרת הבריאות שלך היום.',
    )

    await this.metricsAgent.incrementMetric('statement_sent_failed')
  }
}
