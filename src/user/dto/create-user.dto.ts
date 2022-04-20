import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from "class-validator"

export class CreateUserDto {

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.;,:_-])[A-Za-z0-9.;,:_-]{8,30}$/, { message: 'Mot de passe invalide ! Doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (.-,)' })
    password: string

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    @IsAlphanumeric()
    username: string
} 