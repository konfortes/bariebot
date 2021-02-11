import { AuthGuard } from './../common/auth.guard'
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { AdminService } from './admin.service'
import { UserDto } from './dto/user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private adminService: AdminService,
  ) {
    this.logger = logger.child({ loggerName: AdminController.name })
  }

  @Get('users')
  async users(): Promise<UserDto[]> {
    try {
      const userEntities = await this.adminService.getUsers()

      return userEntities.map(entity => new UserDto(entity))
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  @Get('users/:id')
  async getUser(@Param('id') userId: number): Promise<UserDto> {
    const userEntity = await this.adminService.getUser(userId)

    return new UserDto(userEntity)
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') userId: number,
    @Body() user: UpdateUserDto,
  ): Promise<void> {
    return
  }
}
