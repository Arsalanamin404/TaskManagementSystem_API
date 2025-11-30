import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/generated/prisma/enums';

export class UserSummaryDto {
  @ApiProperty({
    example: 'c3f0f1f2-2d3a-4c1e-a9e6-1b1234567890',
  })
  id!: string;

  @ApiProperty({
    example: 'john@example.com',
  })
  email!: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
  })
  role!: Role;

  @ApiProperty({
    example: '2025-01-25T10:15:30.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2025-01-26T09:20:15.000Z',
  })
  updatedAt!: Date;
}
