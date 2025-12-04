import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { tasks: true },
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const { password, ...sanitizedUser } = user;

    return { profile: sanitizedUser };
  }
  async deleteUserAccount(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.delete({ where: { id } });
  }

  async allUsers() {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async changeRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    return { message: 'Role changed successfully' };
  }
}
