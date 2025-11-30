import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { DeleteAccountResponseDto } from './dto/delete-account-response.dto';
import { AllUsersResponseDto } from './dto/all-users-response.dto';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    role: Role;
  };
}

@Controller('users')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UserController {
  constructor(private userService: UserService) { }

  @Get('me')
  @ApiOperation({
    summary: 'Get authenticated user profile',
    description: 'Returns profile information of the currently logged-in user.',
  })
  @ApiOkResponse({
    description: 'Returns the authenticated user profile.',
    type: UserProfileResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @HttpCode(200)
  async getProfile(@Req() req: RequestWithUser) {
    if (!req.user?.sub) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.userService.getProfile(req.user.sub);
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Delete current user account',
    description: 'Deletes the logged-in user account.',
  })
  @ApiOkResponse({
    description: 'Account deleted successfully.',
    type: DeleteAccountResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
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
  @ApiOperation({
    summary: 'Get all users (Admin)',
    description:
      'Returns a list of all registered users. Admin access required.',
  })
  @ApiOkResponse({
    description: 'Returns the list of all users.',
    type: AllUsersResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Only admin can access this endpoint.' })
  @Roles(Role.ADMIN)
  @HttpCode(200)
  getAll() {
    return this.userService.allUsers();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID (Admin)',
    description:
      'Returns the profile of a specific user using their ID. Admin only.',
  })
  @ApiOkResponse({
    description: 'Returns user details for the given ID.',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiForbiddenResponse({ description: 'Only admin can access this endpoint.' })
  @Roles(Role.ADMIN)
  @HttpCode(200)
  getById(@Param('id') id: string) {
    return this.userService.getProfile(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user by ID (Admin)',
    description:
      'Deletes a specific user account. Only Admin can perform this action.',
  })
  @ApiOkResponse({
    description: 'User account deleted successfully.',
    type: DeleteAccountResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiForbiddenResponse({ description: 'Only admin can access this endpoint.' })
  @Roles(Role.ADMIN)
  @HttpCode(200)
  async deleteById(@Param('id') id: string) {
    await this.userService.deleteUserAccount(id);
    return { message: `user account with id:'${id}'deleted successfully.` };
  }

  @Patch(':id/role')
  @ApiOperation({
    summary: 'Update user role (Admin)',
    description:
      'Allows admin to assign or update the role (ADMIN/USER) of a user.',
  })
  @ApiOkResponse({
    description: 'User role updated successfully.',
  })
  @ApiBadRequestResponse({ description: 'Invalid role value.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiForbiddenResponse({ description: 'Only admin can access this endpoint.' })
  @Roles(Role.ADMIN)
  @HttpCode(200)
  assignRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.userService.changeRole(id, dto.role);
  }
}
