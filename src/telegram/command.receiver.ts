import { AdminNotificationsService } from './admin-notifications.service'
import { Injectable } from '@nestjs/common'
import { Start, Context, Command, Hears } from 'nestjs-telegraf'
import { CommandHandler } from './command.handler'

@Injectable()
export class CommandReceiver {
  constructor(
    private readonly commandHandler: CommandHandler,
    private readonly adminNotification: AdminNotificationsService,
  ) {}

  supportedCommands = [
    { command: 'subscribe', description: 'הרשם לשליחת הצהרת בריאות יומית' },
    { command: 'unsubscribe', description: 'ביטול שליחת הצהרת בריאות יומית' },
  ]

  @Start()
  async start(ctx: Context) {
    try {
      await this.commandHandler.start(ctx.from)
    } catch (err) {
      this.adminNotification.notify(
        `could not create new user(${ctx.from.id}): ${err}`,
      )
    }

    ctx.reply(
      'לשלוח כל יום הצהרת בריאות זה מעפן. אני יכול לעזור לך עם זה. להרשמה לחץ /subscribe',
    )
  }

  @Command('subscribe')
  async subscribe(ctx: Context) {
    try {
      await this.commandHandler.subscribe(ctx)
    } catch (err) {
      await this.adminNotification.notify(
        `error while subscribing user(${ctx.from.id}): ${err}`,
      )
    }
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

    try {
      await this.commandHandler.url(ctx, ctx.message.text)
    } catch (err) {
      await ctx.reply('נתקלתי בבעיה, לא הצלחתי לרשום אותך. נסה שוב מאוחר יותר')
      await this.adminNotification.notify(
        `Error while persisting url for user(${ctx.from.id}): ${err}`,
      )
    }
  }

  @Command('unsubscribe')
  async unsubscribe(ctx: Context) {
    try {
      await this.commandHandler.unsubscribe(ctx)
    } catch (err) {
      ctx.reply('נתקלתי בבעיה, לא הצלחתי להסיר את ההרשמה שלך')
      await this.adminNotification.notify(
        `error unsubscribing user(${ctx.from.id}): ${err}`,
      )
    }
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
