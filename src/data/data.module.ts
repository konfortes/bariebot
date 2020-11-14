import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { UsersStore } from './users.store';

@Module({
  imports: [
    KnexModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: {
          client: configService.get('db.provider'),
          useNullAsDefault: true,
          connection: configService.get('db.connectionString'),
        },
      }),
    }),
  ],
  providers: [UsersStore],
  exports: [UsersStore],
})
export class DataModule {}
