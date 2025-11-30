import { ApiProperty } from '@nestjs/swagger';

export class TaskTitleDto {
  @ApiProperty({
    example: 'Fix login bug',
  })
  title!: string;
}

export class PaginatedTaskTitlesResponseDto {
  @ApiProperty({
    type: () => [TaskTitleDto],
    description: 'List of task titles',
  })
  data!: TaskTitleDto[];

  @ApiProperty({
    example: 42,
    description: 'Total number of tasks',
  })
  total!: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page!: number;

  @ApiProperty({
    example: 10,
    description: 'Items per page',
  })
  limit!: number;

  @ApiProperty({
    example: 5,
    description: 'Total number of pages',
  })
  totalPages!: number;
}
