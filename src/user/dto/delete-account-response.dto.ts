import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountResponseDto {
  @ApiProperty({})
  message!: string;
}
