import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from 'src/prisma/prisma.service';
import ms, { StringValue } from 'ms';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(data: RegisterDto) {
    const existing_user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing_user)
      throw new ConflictException('user with this email already exists');

    const hashed_password = await this.hashPassword(data.password);

    await this.prisma.user.create({
      data: { email: data.email, name: data.name, password: hashed_password },
    });

    return {
      message: 'Registration successful! Please log in to continue.',
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await this.verifyPassword(data.password, user.password))) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const { accessToken, refreshToken } = await this.generateTokens(user);
    return { accessToken, refreshToken };
  }

  async refreshAccesstoken(incommingRefreshToken: string) {
    try {
      const decoded_token = this.jwtService.decode(incommingRefreshToken);
    } catch (error) { }
  }

  // HELPER METHODS
  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(password: string, hash_password: string) {
    return bcrypt.compare(password, hash_password);
  }

  private async hashToken(token: string) {
    return bcrypt.hash(token, 10);
  }

  private async verifyToken(token: string, hash_token: string) {
    return bcrypt.compare(token, hash_token);
  }

  private async generateTokens(user: Pick<User, 'id' | 'email' | 'role'>) {
    const refreshTokenExp =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') ?? '7d',
    });

    await this.storeRefreshToken(user.id, refreshToken, refreshTokenExp);
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
    tokenExpiry: string,
  ): Promise<void> {
    // ms("7d") -> number of ms, e.g. 604800000
    const durationMs = ms(tokenExpiry as StringValue);
    if (typeof durationMs !== 'number') {
      throw new Error(`Invalid token expiry format: ${tokenExpiry}`);
    }

    const expiresAt = new Date(Date.now() + durationMs);
    const tokenHash = await this.hashToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId,
        expiresAt,
      },
    });
  }

  private async generateAccessToken(user: Pick<User, 'id' | 'email' | 'role'>) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '15m',
    });
  }

  private async generateRefreshToken(
    user: Pick<User, 'id' | 'email' | 'role'>,
  ) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') ?? '7d',
    });
  }
}
