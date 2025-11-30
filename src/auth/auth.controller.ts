import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';

// Extend Request for cookies
interface RequestWithCookies extends Request {
  cookies: {
    refresh_token?: string;
  };
}

// Extend Request for user injected by JwtStrategy
interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with email, password, and name.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or email already exists.',
    type: RegisterResponseDto,
  })
  @Post('register')
  @HttpCode(201)
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user with email & password and returns tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns tokens.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
    type: LoginResponseDto,
  })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(data);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Logged in successfully',
      token: accessToken,
    };
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates a new access token using a valid refresh token (cookie or body).',
  })
  @ApiResponse({
    status: 200,
    description: 'New access token generated.',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
    type: RefreshTokenResponseDto,
  })
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: RequestWithCookies,
    @Body('refresh_token') bodyToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawCookieToken = req.cookies?.refresh_token;
    const rawBodyToken = bodyToken;

    const cookieToken =
      typeof rawCookieToken === 'string' ? rawCookieToken : undefined;
    const bodyTokenSafe =
      typeof rawBodyToken === 'string' ? rawBodyToken : undefined;

    const token = cookieToken ?? bodyTokenSafe;

    if (!token) {
      throw new UnauthorizedException('Refresh token not found!');
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshAccesstoken(token);

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true, // or: process.env.NODE_ENV === 'production'
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return { accessToken };
  }

  @ApiOperation({
    summary: 'Logout user',
    description: 'Revokes the refresh token and clears the HTTP-only cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully. Token revoked.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'User not authenticated.',
    type: RegisterResponseDto,
  })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    if (!user?.sub) {
      throw new UnauthorizedException('User not authenticated');
    }

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });

    await this.authService.logout(user.sub);

    return { message: 'Logged out successfully' };
  }
}
