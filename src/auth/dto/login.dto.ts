import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Enter a valid registered email',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @ApiProperty({
    description: 'Enter a valid password',
    example: 'abcd12345',
  })
  @IsNotEmpty({ message: 'password is required' })
  @IsString()
  password!: string;
}
