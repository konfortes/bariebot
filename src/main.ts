import 'newrelic'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'log', 'warn', 'error'],
  })

  const telegrafProvider = app.get('TelegrafProvider')
  const configService = app.get(ConfigService)

  app.use(
    telegrafProvider.webhookCallback(
      configService.get('telegram.webhook.secretPath'),
    ),
  )

  await app.listen(configService.get('port'))
}
bootstrap()
