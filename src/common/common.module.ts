import { HealthController } from './health.controller'
import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import config from './config'
import { WinstonModule } from 'nest-winston'
import loggerConfig from './logging.config'
import * as newrelic from 'newrelic'
import { NR_AGENT } from 'src/consts'

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
  providers: [
    {
      provide: NR_AGENT,
      useValue: newrelic,
    },
  ],
})
export class CommonModule {}
