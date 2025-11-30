import { ApiProperty } from '@nestjs/swagger';
import { UserSummaryDto } from './user-summary.dto';

export class AllUsersResponseDto {
  @ApiProperty({
    description: 'List of all registered users',
    type: () => [UserSummaryDto],
  })
  users!: UserSummaryDto[];
}
