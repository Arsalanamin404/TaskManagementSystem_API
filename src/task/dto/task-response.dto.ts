import { ApiProperty } from '@nestjs/swagger';
import { Status } from 'src/generated/prisma/enums';

export class TaskResponseDto {
  @ApiProperty({
    example: '3a95cdae-9f35-4c98-8ff1-13b9b72123de',
  })
  id!: string;

  @ApiProperty({
    example: 'Fix login bug',
  })
  title!: string;

  @ApiProperty({
    example: 'There is a redirect issue after login.',
    nullable: true,
  })
  content!: string | null;

  @ApiProperty({
    enum: Status,
    example: Status.NOT_STARTED,
  })
  status!: Status;

  @ApiProperty({
    example: 'b71f183e-9278-4c86-8ce8-748cadaa1e41',
    nullable: true,
  })
  assignedToUserId!: string | null;

  @ApiProperty({
    example: '2025-01-25T10:12:45.000Z',
    nullable: true,
  })
  assignedAt!: Date | null;

  @ApiProperty({
    example: '2025-02-01T16:30:00.000Z',
    nullable: true,
  })
  completedAt!: Date | null;

  @ApiProperty({
    example: '2025-01-20T09:15:30.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2025-01-22T11:45:10.000Z',
  })
  updatedAt!: Date;
}
