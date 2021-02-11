import { UserEntity } from 'src/data/entities/user.entity'
export class UserDto {
  user_id: number
  first_name: string
  last_name: string
  username: string
  subscribed: boolean

  constructor(user: UserEntity) {
    this.user_id = user.id
    this.first_name = user.first_name
    this.last_name = user.last_name
    this.username = user.username
    this.subscribed = user.subscribed
  }
}
