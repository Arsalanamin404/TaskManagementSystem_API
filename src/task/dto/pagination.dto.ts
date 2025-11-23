import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class paginationDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
