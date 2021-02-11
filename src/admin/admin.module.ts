import { Module } from '@nestjs/common'
import { DataModule } from 'src/data/data.module'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service';

@Module({
  imports: [DataModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
