import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Enter a valid token inorder to generate new tokens',
    example: 'ahskdhkakksdhkdhkaskjdadjal',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}
