import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoleGuard } from 'src/auth/guards/role.guard';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, RoleGuard],
})
export class UserModule {}
