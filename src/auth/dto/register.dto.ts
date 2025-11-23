import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsNotEmpty({ message: 'password is required' })
  @IsString()
  @MinLength(7, { message: 'password must be atleast of 7 characters' })
  password!: string;

  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  @MinLength(5, { message: 'name must be atleast of 5 characters' })
  @MaxLength(35, { message: 'name cannot exceed 35 characters' })
  name!: string;
}
