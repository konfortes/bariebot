import { User as TelegramUser } from 'telegram-typings'
import { UsersStore } from '../data/users.store'
import { UserEntity } from './entities/user.entity'
import { Injectable } from '@nestjs/common'
import { Context } from 'nestjs-telegraf'

@Injectable()
export class CommandHandler {
  constructor(private readonly usersStore: UsersStore) {}

  async start(user: TelegramUser): Promise<void> {
    const userEntity = UserEntity.fromTelegramUser(user)

    await this.usersStore.insert(userEntity)
  }

  async subscribe(ctx: Context): Promise<void> {
    let existingUser = await this.usersStore.getByExternalId(ctx.from.id)

    // this should not happen. users are created on Start event
    if (!existingUser) {
      await this.usersStore.insert(UserEntity.fromTelegramUser(ctx.from))
      existingUser = await this.usersStore.getByExternalId(ctx.from.id)
    }

    if (!existingUser.declaration_url) {
      await ctx.reply('שלח לי את הקישור להרשמה האישית שלך')

      return
    }

    if (existingUser.subscribed) {
      await ctx.reply('אתה כבר רשום. אם ברצונך לעדכן קישור שלח אותו כעת')

      return
    }

    if (!existingUser.subscribed) {
      await this.usersStore.updateSubscription(
        { external_id: existingUser.external_id },
        true,
      )
      await ctx.reply('רשמתי. אשלח בשמך הצהרת בריאות בכל יום')
    }
  }

  async url(ctx: Context, url: string): Promise<void> {
    await this.usersStore.updateSubscription(
      { external_id: ctx.from.id },
      true,
      url,
    )

    await ctx.reply('רשמתי. אשלח בשמך הצהרת בריאות בכל יום')
  }
  async unsubscribe(ctx: Context): Promise<void> {
    await this.usersStore.updateSubscription(
      { external_id: ctx.from.id },
      false,
    )

    await ctx.reply('ביטלתי את ההרשמה שלך. לא אשלח עוד הצהרת בריאות יומית בשמך')
  }
}
