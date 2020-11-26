import { LinksRepository } from './../data/links.repository'
import { Scraper } from './../scraper/scraper'
import { User as TelegramUser } from 'telegram-typings'
import { UsersRepository } from '../data/users.repository'
import { UserEntity } from '../data/entities/user.entity'
import { Injectable } from '@nestjs/common'

export enum SubscribeResult {
  NO_URL = 0,
  URL_EXISTS,
  UNSUBSCRIBED,
}

@Injectable()
export class CommandHandler {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly linksRepo: LinksRepository,
    private readonly scraper: Scraper,
  ) {}

  async start(user: TelegramUser): Promise<void> {
    await this.usersRepo.insert(UserEntity.fromTelegramUser(user))
  }

  async subscribe(telegramUser: TelegramUser): Promise<SubscribeResult> {
    const user = await this.usersRepo.getOrCreate(
      UserEntity.fromTelegramUser(telegramUser),
    )

    const existingLink = await this.linksRepo.getByUserId(user.id)

    if (!existingLink) {
      return SubscribeResult.NO_URL
    }

    if (user.subscribed) {
      return SubscribeResult.URL_EXISTS
    }

    if (!user.subscribed) {
      await this.usersRepo.updateSubscription(
        { external_id: user.external_id },
        true,
      )

      return SubscribeResult.UNSUBSCRIBED
    }
  }

  async url(telegramUser: TelegramUser, declareUrl: string): Promise<void> {
    const user = await this.usersRepo.getOrCreate(
      UserEntity.fromTelegramUser(telegramUser),
    )

    const name = await this.scraper.scrapeName(declareUrl)

    await this.linksRepo.upsertLink(user.id, declareUrl, name)

    this.usersRepo.updateSubscription({ id: user.id }, true)
  }

  unsubscribe(user: TelegramUser): Promise<void> {
    return this.usersRepo.updateSubscription({ external_id: user.id }, false)
  }
}
