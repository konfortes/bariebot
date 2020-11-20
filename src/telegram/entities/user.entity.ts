import { User as TelegramUser } from 'telegram-typings'

export class UserEntity {
  id: number
  external_id: number
  first_name: string
  last_name?: string
  username?: string
  subscribed: boolean
  declaration_url: string
  created_at: Date

  constructor(
    externalId: number,
    first: string,
    last: string,
    username: string,
    subscribed = false,
    declarationUrl = '',
    createdAt: Date = new Date(),
  ) {
    this.external_id = externalId
    this.first_name = first
    this.last_name = last
    this.username = username
    this.subscribed = subscribed
    this.declaration_url = declarationUrl
    this.created_at = createdAt
  }

  static fromTelegramUser(user: TelegramUser): UserEntity {
    const { id, first_name, last_name, username } = user

    return new UserEntity(id, first_name, last_name, username)
  }
}
