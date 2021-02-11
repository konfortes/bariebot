import { AdminNotificationsService } from '../telegram/admin-notifications.service'
import { ConfigService } from '@nestjs/config'
import {
  Controller,
  Inject,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common'
import { Logger } from 'winston'
import { Request } from 'express'
import { DeclarationService } from './declaration.service'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'

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
