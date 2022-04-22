import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class LoginUserDto {

    @IsEmail()
    @IsNotEmpty()
    @IsOptional()
    email: string

    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    password: string

} 