import { AdminNotificationsService } from '../telegram/admin-notifications.service'
import { ConfigService } from '@nestjs/config'
import { Controller, Post, Req, UnauthorizedException } from '@nestjs/common'
import { Logger } from 'src/common/logger'
import { Request } from 'express'
import { DeclarationService } from './declaration.service'

@Controller('declaration')
export class DeclarationController {
  constructor(
    private readonly declarationService: DeclarationService,
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly adminNotification: AdminNotificationsService,
  ) {}
  @Post()
  async send(@Req() request: Request): Promise<void> {
    // TODO: move to middleware
    this.auth(request.headers['authorization'])

    try {
      await this.declarationService.send()
    } catch (err) {
      const msg = `Error while sending declarations: ${err}`
      this.logger.error(msg)
      this.adminNotification.notify(msg)
    }
  }

  private auth(authToken: string) {
    const apiToken = this.config.get<string>('apiToken')
    if (authToken != `Basic ${apiToken}`) {
      throw new UnauthorizedException()
    }
  }
}
