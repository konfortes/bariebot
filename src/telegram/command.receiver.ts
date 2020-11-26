import { AdminNotificationsService } from './admin-notifications.service'
import { Injectable } from '@nestjs/common'
import { Start, Context, Command, Hears } from 'nestjs-telegraf'
import { CommandHandler, SubscribeResult } from './command.handler'

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
      const subscribeResult = await this.commandHandler.subscribe(ctx.from)

      switch (subscribeResult) {
        case SubscribeResult.NO_URL:
          await ctx.reply('שלח לי את הקישור להרשמה האישית שלך')
          break
        case SubscribeResult.URL_EXISTS:
          await ctx.reply('אתה כבר רשום. אם ברצונך לעדכן קישור שלח אותו כעת')
          break
        case SubscribeResult.UNSUBSCRIBED:
          await ctx.reply('רשמתי. אשלח בשמך הצהרת בריאות בכל יום')
          break
        default:
          await this.adminNotification.notify(
            `Got unknown subscription response (${subscribeResult}) from CommandHandler while trying to subscribe user(${ctx.from.id})`,
          )
          break
      }
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
      await this.commandHandler.url(ctx.from, ctx.message.text)
      await ctx.reply('רשמתי. אשלח בשמך הצהרת בריאות בכל יום')
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
      await this.commandHandler.unsubscribe(ctx.from)
      await ctx.reply(
        'ביטלתי את ההרשמה שלך. לא אשלח עוד הצהרת בריאות יומית בשמך',
      )
    } catch (err) {
      ctx.reply('נתקלתי בבעיה, לא הצלחתי להסיר את ההרשמה שלך')
      await this.adminNotification.notify(
        `error unsubscribing user(${ctx.from.id}): ${err}`,
      )
    }
  }

  private isValidUrl(url: string): boolean {
    const parsedUrl = new URL(url)

    const oldUrlMatch =
      ['http:', 'https:'].includes(parsedUrl.protocol) &&
      parsedUrl.host == 'il.com4com.com' &&
      parsedUrl.pathname == '/web/FormShow.aspx' &&
      parsedUrl.search.includes('MsgStamp')

    const newUrlMatch =
      ['http:', 'https:'].includes(parsedUrl.protocol) &&
      parsedUrl.host == 'il.com4com.com' &&
      parsedUrl.pathname == '/u' &&
      parsedUrl.search.includes('?') &&
      parsedUrl.search.length > 3

    return oldUrlMatch || newUrlMatch
  }
}
