import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController]
})
export class AdminModule {}
