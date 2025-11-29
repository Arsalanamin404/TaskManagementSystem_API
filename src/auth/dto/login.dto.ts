import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsNotEmpty({ message: 'password is required' })
  @IsString()
  password!: string;
}
