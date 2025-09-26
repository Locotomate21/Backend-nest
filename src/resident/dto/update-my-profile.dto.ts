    import { Matches, IsOptional, IsString } from 'class-validator';

    export class UpdateMyProfileDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{7,15}$/, { message: 'El teléfono debe contener solo dígitos (10 digitos)' })
    phone?: string;

    }
