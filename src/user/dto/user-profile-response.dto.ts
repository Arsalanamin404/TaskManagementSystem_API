import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/generated/prisma/enums';
import { UserTaskDto } from './user-task.dto';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Unique user ID',
    example: 'c3f0f1f2-2d3a-4c1e-a9e6-1b1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    description: 'Role of the user',
    example: Role.USER,
    enum: Role,
  })
  role!: Role;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-01-25T10:15:30.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2025-01-26T09:20:15.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Tasks assigned to the user',
    type: () => [UserTaskDto],
  })
  tasks!: UserTaskDto[];
}
