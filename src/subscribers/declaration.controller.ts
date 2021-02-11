import { AdminNotificationsService } from '../telegram/admin-notifications.service'
import { ConfigService } from '@nestjs/config'
import { Controller, Inject, Post, UseGuards } from '@nestjs/common'
import { Logger } from 'winston'
import { DeclarationService } from './declaration.service'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { AuthGuard } from 'src/common/auth.guard'

@UseGuards(AuthGuard)
@Controller('declaration')
export class DeclarationController {
  constructor(
    private readonly declarationService: DeclarationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly config: ConfigService,
    private readonly adminNotification: AdminNotificationsService,
  ) {
    this.logger = logger.child({ loggerName: DeclarationController.name })
  }
  @Post()
  async send(): Promise<void> {
    try {
      await this.declarationService.send()
    } catch (err) {
      const msg = `Error while sending declarations: ${err}`
      this.logger.error(msg)
      this.adminNotification.notify(msg)
    }
  }
}
