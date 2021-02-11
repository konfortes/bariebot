import { ConfigService } from '@nestjs/config'
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    let authorized = false

    const request = context.switchToHttp().getRequest()

    const authToken = request.headers['authorization']
    const apiToken = this.config.get<string>('apiToken')
    if (authToken == `Basic ${apiToken}`) {
      authorized = true
    }

    return authorized
  }
}
