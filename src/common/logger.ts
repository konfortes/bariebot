import { Injectable } from '@nestjs/common'
import { Logger as NestLogger } from '@nestjs/common'

@Injectable()
export class Logger extends NestLogger {}
