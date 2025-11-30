import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Status } from 'src/generated/prisma/enums';
import { TaskStatus } from '../enum/task-status.enum';

export class UpdateAssignedTaskStatusDto {
  @ApiProperty({
    description: 'Status of Tasks',
    example: TaskStatus.IN_PROGRESS,
    enum: TaskStatus,
  })
  @IsEnum(Status)
  status!: Status;
}
