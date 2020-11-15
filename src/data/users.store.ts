import { Injectable } from '@nestjs/common'
import { InjectKnex, Knex } from 'nestjs-knex'
import { UserEntity } from 'src/telegram/entities/user.entity'

@Injectable()
export class UsersStore {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async getByExternalId(externalId: number): Promise<UserEntity> {
    return await this.knex<UserEntity>('users')
      .where('external_id', externalId)
      .first()
  }

  async insert(user: UserEntity): Promise<number> {
    const id = await this.knex('users')
      .insert(user)
      .returning('id')

    return id[0]
  }

  async updateSubscription(where: any, subscription: boolean, url = '') {
    const update = { subscribed: subscription }
    if (url.length > 0) {
      update['declaration_url'] = url
    }

    await this.knex('users')
      .where(where)
      .update(update)
  }

  async getSubscribedUsers(): Promise<UserEntity[]> {
    return await this.knex('users').where({ subscribed: true })
  }
}
