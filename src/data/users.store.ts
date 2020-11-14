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
    try {
      const id = await this.knex('users')
        .insert(user)
        .returning('id')

      return id[0]
    } catch (ex) {
      console.log(ex)
      return 0
    }
  }

  async updateSubscription(where: any, subscription: boolean) {
    await this.knex('users')
      .where(where)
      .update({ subscribed: subscription })
  }

  async getSubscribedUsers(): Promise<UserEntity[]> {
    return await this.knex('users').where({ subscribed: true })
  }
}
