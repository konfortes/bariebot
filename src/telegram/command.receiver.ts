import { UserEntity } from './entities/user.entity'
import { Injectable } from '@nestjs/common'
import { Start, Context, Command, Hears } from 'nestjs-telegraf'
import { CommandHandler } from './command.handler'

@Injectable()
export class CommandReceiver {
  constructor(private readonly commandHandler: CommandHandler) {}

  supportedCommands = [
    { command: 'subscribe', description: 'הרשם לשליחת הצהרת בריאות יומית' },
    { command: 'unsubscribe', description: 'ביטול שליחת הצהרת בריאות יומית' },
  ]

  @Start()
  start(ctx: Context) {
    ctx.reply('לשלוח כל יום הצהרת בריאות זה מעפן. אני יכול לעזור לך עם זה')
  }

  @Command('subscribe')
  async subscribe(ctx: Context) {
    ctx.reply('שלח לי את הלינק להרשמה האישית שלך')
  }

  @Hears(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
  )
  async url(ctx: Context) {
    // TODO: check it is a subscription request
    const user = UserEntity.fromTelegramUser(ctx.from)
    user.declaration_url = ctx.message.text
    await this.commandHandler.subscribe(user)

    await ctx.reply('רשמתי. אשלח בשמך הצהרת בריאות כל יום')
  }

  @Command('unsubscribe')
  async unsubscribe(ctx: Context) {
    const user = UserEntity.fromTelegramUser(ctx.from)
    await this.commandHandler.unsubscribe(user)

    await ctx.reply('ביטלתי את ההרשמה שלך. לא אשלח עוד הצהרת בריאות יומית בשמך')
  }
}
