import { NextFunction, Request, Response } from 'express';
import AuthService from './auth.service';
import {
    AuthDto,
    CheckCodeDto,
    ResetPhoneDto,
    UpdatePhoneDto,
} from './dto/auth.dto';

export default class AuthController {
    public authService = new AuthService();

    public SendSms = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { phone }: AuthDto = req.body;

            const data = await this.authService.SignWithPhone(
                phone,
                'Foydalanuvchi',
                req.body.user_ip
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public SendCode = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { phone }: AuthDto = req.body;

            const data = await this.authService.SendCode(phone);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public CheckPhoneNumber = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { phone, code }: CheckCodeDto = req.body;

            const data = await this.authService.CheckPhoneNumber(phone, code);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public ResetPhoneNumber = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { oldPhone, phone }: ResetPhoneDto = req.body;

            const data = await this.authService.ResetPhoneNumber(
                oldPhone,
                phone
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public UpdatePhoneNumber = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { oldPhone, phone, code }: UpdatePhoneDto = req.body;

            const data = await this.authService.UpdatePhoneNumber(
                oldPhone,
                phone,
                code
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public SendSmsAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { phone }: AuthDto = req.body;
            console.log(phone,"ph");
            

            const data = await this.authService.SignWithPhoneAdmin(phone);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public CheckSms = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { phone, code }: CheckCodeDto = req.body;

            const data = await this.authService.CheckCode(
                phone,
                code,
                req.body.user_device,
                req.body.user_browser,
                req.body.user_ip
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };
}
