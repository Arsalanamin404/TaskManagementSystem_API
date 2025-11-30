import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Enter your email address',
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
  @MinLength(7, { message: 'password must be atleast of 7 characters' })
  password!: string;

  @ApiProperty({
    description: 'Enter your full name',
    example: 'Arsalan Rather',
  })
  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  @MinLength(5, { message: 'name must be atleast of 5 characters' })
  @MaxLength(35, { message: 'name cannot exceed 35 characters' })
  name!: string;
}
