import { Injectable } from '@nestjs/common'
import { InjectKnex, Knex } from 'nestjs-knex'
import { UserEntity } from 'src/data/entities/user.entity'

@Injectable()
export class UsersRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async getAllUsers(): Promise<UserEntity[]> {
    return await this.knex<UserEntity>('users').select('*')
  }

  async getByUserId(id: number) {
    return await this.knex<UserEntity>('users')
      .select('*')
      .where('id', id)
      .first()
  }

  async getOrCreate(user: UserEntity): Promise<UserEntity> {
    let existingUser = await this.getByExternalId(user.external_id)
    if (!existingUser) {
      await this.insert(user)
      existingUser = await this.getByExternalId(user.external_id)
    }

    return existingUser
  }

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

  async updateSubscription(where: any, subscription: boolean) {
    await this.knex('users')
      .where(where)
      .update({ subscribed: subscription })
  }

  async getSubscribedUsers(): Promise<UserEntity[]> {
    return await this.knex('users').where({ subscribed: true })
  }
}
