import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsNotEmpty({ message: 'password is required' })
  @IsString()
  @MinLength(7, { message: 'password must be atleast of 7 characters' })
  password!: string;
}
