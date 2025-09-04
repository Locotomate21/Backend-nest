    import { Injectable } from '@nestjs/common';
    import { PassportStrategy } from '@nestjs/passport';
    import { ExtractJwt, Strategy } from 'passport-jwt';
    import { ConfigService } from '@nestjs/config';

    @Injectable()
    export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_SECRET', 'mysecretkey'),
        });
    }

    async validate(payload: any) {
    console.log('🎫 JWT Payload recibido:', payload);
    return { 
        _id: payload.sub,  
        role: payload.role,
        email: payload.email ?? null,
        fullName: payload.fullName ?? null,
        floor: payload.floor,
    };
    }
}


