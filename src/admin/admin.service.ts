import { UserDto } from './dto/user.dto'
import { Body, Get, Inject, Injectable, Param, Put } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersRepository } from '../data/users.repository'
import { LinksRepository } from '../data/links.repository'
import { UserEntity } from 'src/data/entities/user.entity'

@Injectable()
export class AdminService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly usersRepo: UsersRepository,
  ) {
    this.logger = logger.child({ loggerName: AdminService.name })
  }

  @Get('users')
  async getUsers(): Promise<UserEntity[]> {
    return await this.usersRepo.getAllUsers()
  }

  async getUser(userId: number): Promise<UserEntity> {
    return await this.usersRepo.getByUserId(userId)
  }

  async updateUser(userId: number, user: UpdateUserDto): Promise<void> {
    return
  }
}
