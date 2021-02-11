import {
  WinstonModuleOptions,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston'
import * as winston from 'winston'

export default function loggerConfig(): WinstonModuleOptions {
  const env: string = process.env.NODE_ENV || 'development'
  return {
    level: process.env.LOG_LEVEL || 'info',
    transports: transportConfig(env),
  }
}

function transportConfig(env: string) {
  if (env === 'development') {
    return devTransport()
  } else {
    return prodTransport()
  }
}

function devTransport() {
  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      nestWinstonModuleUtilities.format.nestLike(),
    ),
  })
}

function prodTransport() {
  return new winston.transports.Console({
    format: winston.format.json(),
  })
}
