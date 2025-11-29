import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @HttpCode(200)
  getAll() {}

  @Get('me')
  @HttpCode(200)
  profile() {}

  @Get(':id')
  @HttpCode(200)
  getById(@Param('id') id: string) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteById(@Param('id') id: string) {}
}
