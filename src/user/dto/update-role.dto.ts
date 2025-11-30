import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role to assign to the user',
    example: Role.ADMIN,
    enum: Role,
  })
  @IsEnum(Role, { message: 'Role must be either ADMIN or USER' })
  role!: Role;
}
