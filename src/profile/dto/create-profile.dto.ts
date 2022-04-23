import { IsOptional, IsString, IsUrl, MinLength } from "class-validator"

export class CreateProfileDto {

    @IsString()
    @MinLength(150)
    bio: string

    @IsOptional()
    @IsUrl()
    photo: string
} 
