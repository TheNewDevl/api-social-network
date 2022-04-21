/* import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv'
dotenv.config()

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.SECRET_KEY
        });
    }

    async validate(payload: any) {
        console.log(payload);
        return { userId: payload.id, username: payload.username , role: payload.role};
    }
} */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv'
dotenv.config()

@Injectable()
export class JwtStrategyTest extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.SECRET_KEY
        });
    }

    async validate(payload: any) {
        if (payload.role != 'admin') {
            throw new UnauthorizedException('Acces interdit')
        }
        console.log(payload);
        return { userId: payload.id, username: payload.username, role: payload.role };
    }
}