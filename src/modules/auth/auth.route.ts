import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import AuthController from './auth.controller';
import {
    AuthDto,
    CheckCodeDto,
    ResetPhoneDto,
    SignInDto,
    SignUpDto,
    UpdatePhoneDto,
} from './dto/auth.dto';
import { requestChecker } from '../shared/middlewares/requestCheker';

export default class AuthRoute implements Routes {
    public path = '/user/';
    public router = Router();
    public authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}admin/login`,
            validate(SignInDto, 'body', true),
            this.authController.SendSmsAdmin
        );
        this.router.post(
            `${this.path}sign/phone`,
            requestChecker,
            validate(AuthDto, 'body', true),
            this.authController.SendSms
        );
        this.router.post(
            `${this.path}send`,
            requestChecker,
            validate(AuthDto, 'body', true),
            this.authController.SendCode
        );
        this.router.post(
            `${this.path}check`,
            requestChecker,
            validate(CheckCodeDto, 'body', true),
            this.authController.CheckPhoneNumber
        );
        this.router.post(
            `${this.path}reset`,
            requestChecker,
            validate(ResetPhoneDto, 'body', true),
            this.authController.ResetPhoneNumber
        );
        this.router.post(
            `${this.path}phone/update`,
            requestChecker,
            validate(UpdatePhoneDto, 'body', true),
            this.authController.UpdatePhoneNumber
        );
        this.router.post(
            `${this.path}check/phone`,
            requestChecker,
            validate(CheckCodeDto, 'body', true),
            this.authController.CheckSms
        );
    }
}
