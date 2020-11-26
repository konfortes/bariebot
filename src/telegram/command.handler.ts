import { User as TelegramUser } from 'telegram-typings'
import { UsersStore } from '../data/users.store'
import { UserEntity } from './entities/user.entity'
import { Injectable } from '@nestjs/common'

export enum SubscribeResult {
  NO_URL = 0,
  URL_EXISTS,
  UNSUBSCRIBED,
}

@Injectable()
export class CommandHandler {
  constructor(private readonly usersStore: UsersStore) {}

  async start(user: TelegramUser): Promise<void> {
    const userEntity = UserEntity.fromTelegramUser(user)

    await this.usersStore.insert(userEntity)
  }

  async subscribe(user: TelegramUser): Promise<SubscribeResult> {
    let existingUser = await this.usersStore.getByExternalId(user.id)

    // this should not happen. users are created on Start event
    if (!existingUser) {
      await this.usersStore.insert(UserEntity.fromTelegramUser(user))
      existingUser = await this.usersStore.getByExternalId(user.id)
    }

    if (!existingUser.declaration_url) {
      return SubscribeResult.NO_URL
    }

    if (existingUser.subscribed) {
      return SubscribeResult.URL_EXISTS
    }

    if (!existingUser.subscribed) {
      await this.usersStore.updateSubscription(
        { external_id: existingUser.external_id },
        true,
      )

      return SubscribeResult.UNSUBSCRIBED
    }
  }

  async url(user: TelegramUser, url: string): Promise<void> {
    return await this.usersStore.updateSubscription(
      { external_id: user.id },
      true,
      url,
    )
  }
  async unsubscribe(user: TelegramUser): Promise<void> {
    return await this.usersStore.updateSubscription(
      { external_id: user.id },
      false,
    )
  }
}
