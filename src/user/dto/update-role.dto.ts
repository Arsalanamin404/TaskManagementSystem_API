import { IsEnum } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

export class UpdateRoleDto {
  @IsEnum(Role, { message: 'role must be ADMIN or USER' })
  role!: Role;
}
