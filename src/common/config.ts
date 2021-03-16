export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  apiToken: process.env.API_TOKEN,
  db: {
    provider: 'pg',
    connectionString: process.env.DATABASE_URL1,
  },
  telegram: {
    botToken: process.env.BOT_TOKEN,
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
    webhook: {
      secretPath: process.env.SECRET_WEBHOOK_PATH,
      domain: process.env.WEBHOOK_DOMAIN,
    },
  },
})
