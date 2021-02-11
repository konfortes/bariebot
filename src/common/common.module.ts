import { HealthController } from './health.controller'
import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import config from './config'
import { WinstonModule } from 'nest-winston'
import loggerConfig from './logging.config'

@Global()
@Module({
  imports: [
    WinstonModule.forRoot(loggerConfig()),
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
  ],
  controllers: [HealthController],
})
export class CommonModule {}
