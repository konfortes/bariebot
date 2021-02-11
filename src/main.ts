import 'newrelic'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'log', 'warn', 'error'],
  })
  app.enableShutdownHooks()

  const telegrafProvider = app.get('TelegrafProvider')
  const configService = app.get(ConfigService)

  app.use(
    telegrafProvider.webhookCallback(
      configService.get('telegram.webhook.secretPath'),
    ),
  )

  const logger = app.get(WINSTON_MODULE_PROVIDER)

  const port = configService.get('port')
  logger.info(`listening on port ${port}...`)
  await app.listen(port)
}
bootstrap()
