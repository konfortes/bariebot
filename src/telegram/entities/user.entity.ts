import { User } from 'telegram-typings'

export class UserEntity {
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
  id: number
  external_id: number
  first_name: string
  last_name?: string
  username?: string
  subscribed: boolean
  declaration_url: string
  created_at: Date

  static fromTelegramUser(user: User): UserEntity {
    return new UserEntity(
      user.id,
      user.first_name,
      user.last_name,
      user.username,
    )
  }
}
