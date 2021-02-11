import { AdminNotificationsService } from '../telegram/admin-notifications.service'
import { Controller, Inject, Post, UseGuards } from '@nestjs/common'
import { Logger } from 'winston'
import { StatementService } from './statement.service'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { AuthGuard } from 'src/common/auth.guard'

@UseGuards(AuthGuard)
@Controller('statement')
export class StatementController {
  constructor(
    private readonly statementService: StatementService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly adminNotification: AdminNotificationsService,
  ) {
    this.logger = logger.child({ loggerName: StatementController.name })
  }
  @Post()
  async send(): Promise<void> {
    try {
      await this.statementService.send()
    } catch (err) {
      const msg = `Error while sending statements: ${err}`
      this.logger.error(msg)
      this.adminNotification.notify(msg)
    }
  }
}
