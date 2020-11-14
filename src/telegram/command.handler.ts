import { UsersStore } from '../data/users.store'
import { UserEntity } from './entities/user.entity'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CommandHandler {
  MSW_URL = 'https://magicseaweed.com/Hazuk-Beach-Surf-Report/3659/'
  FORECAST_SELECTOR_TODAY =
    '#msw-js-fc > div.table-responsive-xs > table > tbody:nth-child(2)'
  FORECAST_SELECTOR_TOMORROW =
    '#msw-js-fc > div.table-responsive-xs > table > tbody:nth-child(3)'

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
