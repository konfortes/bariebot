import { HealthController } from './health.controller';
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Logger } from './logger';
import config from './config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
  ],
  controllers: [HealthController],
  providers: [Logger],
  exports: [Logger],
})
export class CommonModule {}
