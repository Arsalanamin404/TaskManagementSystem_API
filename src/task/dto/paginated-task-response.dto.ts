import { ApiProperty } from '@nestjs/swagger';
import { Role, Status } from 'src/generated/prisma/enums';

export class AssignedUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class TaskWithAssignedUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  content!: string | null;

  @ApiProperty({ enum: Status, example: Status.NOT_STARTED })
  status!: Status;

  @ApiProperty({ nullable: true })
  assignedToUserId!: string | null;

  @ApiProperty({ type: () => AssignedUserDto, nullable: true })
  assignedToUser!: AssignedUserDto | null;

  @ApiProperty({ nullable: true })
  assignedAt!: Date | null;

  @ApiProperty({ nullable: true })
  completedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginatedTasksResponseDto {
  @ApiProperty({ type: () => [TaskWithAssignedUserDto] })
  data!: TaskWithAssignedUserDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
