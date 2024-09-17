import { NextFunction, Request, Response } from 'express';
import UserService from './user.service';
import { CreateUserDto, UpdateDeposit, UpdateUserDto } from './dto/user.dto';
import { uploadFile } from '../shared/utils/uploadFile';
import { ISearchQuery } from '../shared/interface/query.interface';
import OrderService from '../order/order.service';
import extractQuery from '../shared/utils/extractQuery';
import TokenService from '../auth/providers/token.service';
import { ITokenPayload } from '../auth/interface/auth.interface';

export default class UserController {
    private userService = new UserService();
    private orderService = new OrderService();
    private jwtService = new TokenService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { name, region, phone }: CreateUserDto = req.body;

            const data = await this.userService.create({
                name,
                region,
                phone,
            });

            res.status(201).json({
                success: true,
                data,
                message: `Foydalanuvchi muvafaqqiyatli yaratildi`,
            });
        } catch (error) {
            next(error);
        }
    };

    // for Admin
    public getAllUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;
            const data = await this.userService.getAll(
                false,
                filter,
                page,
                limit
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };
    // for Admin
    public getAllOperators = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;
            const data = await this.userService.getAll(
                true,
                filter,
                page,
                limit
            );
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.body.user_id;
            const orderCount = await this.orderService.userOrderCount(userId);
            const user = await this.userService.findOne(userId);

            res.status(200).json({ orderCount, user });
        } catch (error) {
            next(error);
        }
    };

    public updateForUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { user_id } = req.body;

            const {
                telegramID,
                name,
                avatar,
                surname,
                nickname,
                email,
            }: UpdateUserDto = req.body;
            var userData = {
                telegramID,
                name,
                avatar,
                surname,
                nickname,
                email,
            };

            if (req['files']) {
                const image = await uploadFile(req['files']['avatar']);

                userData.avatar = image[0];
            }

            const user = await this.userService.update(user_id, userData);

            const accessTokenPayload: ITokenPayload = { user_id: user._id };

            const accessToken =
                this.jwtService.getAccessToken(accessTokenPayload);

            res.status(200).json({ user, token: accessToken });
        } catch (error) {
            next(error);
        }
    };

    public updateForAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const userData: UpdateUserDto = req.body;

            const data = await this.userService.update(id, userData);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public updateDeposit = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { deposit }: UpdateDeposit = req.body;

            const data = await this.userService.update(id, { deposit });

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;

            await this.userService.delete(id);

            res.status(200).json({
                success: true,
                message: `Foydalanuvchi muvafaqqiyatli o'chirildi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public searchGlobal = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const users = await this.userService.searchGlobal(filter);

            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    };

    public operatorStatistics = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { userId, type, status, page, limit } =
                extractQuery(query).sorts;

            const data = await this.orderService.operatorStatistics(
                userId,
                type,
                status,
                page,
                limit
            );

            const user = await this.userService.findOne(
                userId,
                ' -createdAt -updatedAt -__v -soldProCount'
            );

            res.status(200).json({ user, ...data });
        } catch (error) {
            next(error);
        }
    };

    public userStatistics = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { userId, type, status, page, limit } =
                extractQuery(query).sorts;

            const data = await this.orderService.userStatistics(
                userId,
                type,
                status,
                page,
                limit
            );

            const user = await this.userService.findOne(
                userId,
                ' -createdAt -updatedAt -__v -soldProCount'
            );

            res.status(200).json({ user, ...data });
        } catch (error) {
            next(error);
        }
    };
}
