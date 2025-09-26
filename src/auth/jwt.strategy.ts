    import { Injectable } from '@nestjs/common';
    import { PassportStrategy } from '@nestjs/passport';
    import { ExtractJwt, Strategy } from 'passport-jwt';
    import { ConfigService } from '@nestjs/config';

    interface JwtPayload {
    sub: string;
    role: string;
    email: string;
    fullName: string;
    floor: number | null;
    }

    @Injectable()
    export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_SECRET', 'mysecretkey'),
        });
    }

    async validate(payload: JwtPayload) {
        return {
        sub: payload.sub, // 👈 lo dejamos estándar por si otro servicio lo usa
        _id: payload.sub, // 👈 lo duplicamos como _id para tu comodidad
        role: payload.role,
        email: payload.email ?? null,
        fullName: payload.fullName ?? null,
        floor: payload.floor ?? null,
        };
    }
    }
