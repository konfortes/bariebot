import { UsersStore } from '../data/users.store'
import { UserEntity } from './entities/user.entity'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CommandHandler {
  constructor(private readonly usersStore: UsersStore) {}

  async subscribe(user: UserEntity): Promise<void> {
    const existingUser = await this.usersStore.getByExternalId(user.external_id)

    if (!existingUser) {
      user.subscribed = true
      await this.usersStore.insert(user)

      return
    }

    await this.usersStore.updateSubscription(
      { external_id: user.external_id },
      true,
      user.declaration_url,
    )

    return
  }
  async unsubscribe(user: UserEntity): Promise<void> {
    await this.usersStore.updateSubscription(
      { external_id: user.external_id },
      false,
    )
  }
}
