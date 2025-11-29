import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Role } from 'src/generated/prisma/enums';
import { UpdateRoleDto } from './dto/update-role.dto';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    role: Role;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @HttpCode(200)
  async getProfile(@Req() req: RequestWithUser) {
    if (!req.user?.sub) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.userService.getProfile(req.user.sub);
  }

  // @Patch('me')
  // @HttpCode(200)
  // updateProfile() {}

  @Delete('me')
  @HttpCode(200)
  async deleteAccount(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user?.sub) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.userService.deleteUserAccount(req.user.sub);
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Account deleted successfully' };
  }

  // admin only
  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(200)
  getAll() {
    return this.userService.allUsers();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @HttpCode(200)
  getById(@Param('id') id: string) {
    return this.userService.getProfile(id);
  }

  // @Patch(':id')
  // @Roles('ADMIN')
  // @HttpCode(200)
  // updateById(@Param('id') id: string) { }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(200)
  deleteById(@Param('id') id: string) {
    return this.userService.deleteUserAccount(id);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @HttpCode(200)
  assignRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.userService.changeRole(id, dto.role);
  }
}
