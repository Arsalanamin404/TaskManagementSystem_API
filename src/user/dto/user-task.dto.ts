import { ApiProperty } from '@nestjs/swagger';
import { Status } from 'src/generated/prisma/enums';

export class UserTaskDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  content!: string | null;

  @ApiProperty({
    enum: Status,
    example: Status.NOT_STARTED,
  })
  status!: Status;

  @ApiProperty({ nullable: true })
  assignedToUserId!: string | null;

  @ApiProperty({ nullable: true })
  assignedAt!: Date | null;

  @ApiProperty({ nullable: true })
  completedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
