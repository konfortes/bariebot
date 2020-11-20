import { UsersStore } from './../data/users.store'
import { AdminNotificationsService } from './admin-notifications.service'
import { UserEntity } from './entities/user.entity'
import { Injectable } from '@nestjs/common'
import { Start, Context, Command, Hears } from 'nestjs-telegraf'
import { CommandHandler } from './command.handler'

@Injectable()
export class CommandReceiver {
  constructor(
    private readonly commandHandler: CommandHandler,
    private readonly adminNotification: AdminNotificationsService,
    private readonly userStore: UsersStore,
  ) {}

  supportedCommands = [
    { command: 'subscribe', description: 'הרשם לשליחת הצהרת בריאות יומית' },
    { command: 'unsubscribe', description: 'ביטול שליחת הצהרת בריאות יומית' },
  ]

  @Start()
  start(ctx: Context) {
    ctx.reply(
      'לשלוח כל יום הצהרת בריאות זה מעפן. אני יכול לעזור לך עם זה. להרשמה לחץ /subscribe',
    )
  }

  @Command('subscribe')
  async subscribe(ctx: Context) {
    const existingUser = await this.userStore.getByExternalId(ctx.from.id)

    if (existingUser && existingUser.subscribed) {
      await ctx.reply('אתה כבר רשום. אם ברצונך לעדכן קישור שלח אותו כעת')
      return
    }

    if (existingUser && !existingUser.subscribed) {
      await ctx.reply('שלח לי את הקישור להרשמה האישית שלך')
      return
    }

    // no existing user
    await this.userStore.insert(UserEntity.fromTelegramUser(ctx.from))
    await ctx.reply('שלח לי את הקישור להרשמה האישית שלך')
  }

  @Hears(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
  )
  async url(ctx: Context) {
    // TODO: check it is a subscription request

    if (!this.isValidUrl(ctx.message.text)) {
      await ctx.reply('הקישור ששלחת לא תקין')
      await this.adminNotification.notify(
        `got invalid url from user(${ctx.from.id} - ${ctx.from.first_name}): ${ctx.message.text}`,
      )
      return
    }

    const user = UserEntity.fromTelegramUser(ctx.from)
    user.declaration_url = ctx.message.text
    try {
      await this.commandHandler.subscribe(user)
    } catch (err) {
      await ctx.reply('נתקלתי בבעיה, לא הצלחתי לרשום אותך')
      await this.adminNotification.notify(
        `error subscribing user(${user.external_id}) with url(${user.declaration_url}): ${err}`,
      )
      return
    }

    await ctx.reply('רשמתי. אשלח בשמך הצהרת בריאות בכל יום')
  }

  @Command('unsubscribe')
  async unsubscribe(ctx: Context) {
    const user = UserEntity.fromTelegramUser(ctx.from)
    try {
      await this.commandHandler.unsubscribe(user)
    } catch (err) {
      ctx.reply('נתקלתי בבעיה, לא הצלחתי להסיר את ההרשמה שלך')
      await this.adminNotification.notify(
        `error unsubscribing user(${user.external_id}): ${err}`,
      )
      return
    }

    await ctx.reply('ביטלתי את ההרשמה שלך. לא אשלח עוד הצהרת בריאות יומית בשמך')
  }

  private isValidUrl(url: string): boolean {
    const parsedUrl = new URL(url)

    return (
      ['http:', 'https:'].includes(parsedUrl.protocol) &&
      parsedUrl.host == 'il.com4com.com' &&
      parsedUrl.pathname == '/web/FormShow.aspx' &&
      parsedUrl.search.includes('MsgStamp')
    )
  }
}
