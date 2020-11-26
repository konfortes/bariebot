import { LinksRepository } from './links.repository'
import { ConfigService } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { KnexModule } from 'nestjs-knex'
import { UsersRepository } from './users.repository'

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
  providers: [UsersRepository, LinksRepository],
  exports: [UsersRepository, LinksRepository],
})
export class DataModule {}
