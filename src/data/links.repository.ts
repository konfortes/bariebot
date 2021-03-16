import { LinkEntity } from './entities/link.entity'
import { Injectable } from '@nestjs/common'
import { InjectKnex, Knex } from 'nestjs-knex'

@Injectable()
export class LinksRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  insertLink(userId: number, url: string, name: string): Promise<void> {
    const data = {
      user_id: userId,
      value: url,
      name,
      created_at: new Date(),
    }

    return this.knex('links').insert(data)
  }

  updateLink(userId: number, url: string, name: string): Promise<void> {
    const data = {
      user_id: userId,
      value: url,
      name,
      created_at: new Date(),
    }

    return this.knex('links')
      .where({ id: userId })
      .update(data)
  }

  async upsertLink(userId: number, url: string, name: string): Promise<void> {
    const existingLink = await this.getByUserId(userId)
    if (existingLink) {
      return this.updateLink(userId, url, name)
    }

    return this.insertLink(userId, url, name)
  }

  updateLastSent(userId: number, ts: Date = new Date()): Promise<void> {
    return this.knex('links')
      .where({ id: userId })
      .update({ last_sent_at: ts })
  }

  getByUserId(id: number): Promise<LinkEntity> {
    return this.knex('links')
      .where({ user_id: id })
      .first()
  }
}
