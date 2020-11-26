export class LinkEntity {
  id: number
  user_id: number
  value: string
  name: string
  created_at: Date

  constructor(
    userId: number,
    value: string,
    name: string,
    createdAt: Date = new Date(),
  ) {
    this.user_id = userId
    this.value = value
    this.name = name
    this.created_at = createdAt
  }
}
