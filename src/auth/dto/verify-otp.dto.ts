import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsNotEmpty({ message: 'otp is required' })
  @IsString()
  @MinLength(6, { message: 'enter a valid 6 digit OTP' })
  @MaxLength(6, { message: 'enter a valid 6 digit OTP' })
  otp!: string;
}
