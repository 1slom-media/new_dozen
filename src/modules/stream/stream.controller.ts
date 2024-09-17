import { NextFunction, Request, Response } from 'express';
import StreamService from './stream.service';
import { CreateStreamDto, UpdateStreamForUser } from './dto/stream.dto';
import OrderService from '../order/order.service';
import extractQuery from '../shared/utils/extractQuery';
import { ISearchQuery } from '../shared/interface/query.interface';

export default class StreamController {
    private streamService = new StreamService();
    private orderService = new OrderService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const streamData: CreateStreamDto = req.body;

            const data = await this.streamService.create({
                ...streamData,
                user: req.body.user_id,
            });

            res.status(201).json({
                success: true,
                data,
                message: `Oqim muvafaqqiyatli yaratildi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public getAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { page, limit } = extractQuery(query).sorts;
            let streamDetails = {
                new: 0,
                ready: 0,
                onway: 0,
                delivered: 0,
                canceled: 0,
                hold: 0,
                archived: 0,
                visits_count: 0,
                pending: 0,
            };
            const { user_id } = req.body;
            const userOrders = await this.orderService.getOrderWithUser(
                user_id
            );

            userOrders.forEach((order) => {
                streamDetails[order.status] += 1;
            });

            const { countPage, streams } = await this.streamService.getAll(
                user_id,
                page,
                limit,
                filter
            );

            const svisits = await this.streamService.findByUserId(user_id);
            svisits.forEach((stream) => {
                streamDetails.visits_count += stream.visits_count;
            });

            res.status(200).json({
                streamDetails,
                streams,
                countPage,
            });
        } catch (error) {
            next(error);
        }
    };

    public findOne = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { number } = req.params;

            const payload = await this.streamService.findOne(Number(number));

            res.status(200).json({
                success: true,
                payload: Object.assign(payload),
            });
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

            await this.streamService.delete(id);

            res.status(200).json({
                success: true,
                message: `Oqim muvafaqqiyatli o'chirildi`,
            });
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
            const { number } = req.params;
            const { isRegionOn }: UpdateStreamForUser = req.body;
            const data = await this.streamService.updateForUser(
                Number(number),
                isRegionOn
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getAllStreamNumber = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.streamService.getAllStreamNumber();

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getDetailStream = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { number } = req.params;
            const { user_id } = req.body;
            const { page, limit } = extractQuery(query).sorts;
            const stream = await this.streamService.getDetailStream(
                Number(number),
                user_id
            );

            const orders = await this.orderService.findByStreamId(
                stream._id,
                page,
                limit
            );

            res.status(200).json({ stream, orders });
        } catch (error) {
            next(error);
        }
    };

    public getDetailStreams = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { status, page, limit } = extractQuery(query).sorts;

            const { user_id } = req.body;
            const orders = await this.orderService.findByStreamOrders(
                user_id,
                status,
                page,
                limit,
                filter
            );

            res.status(200).json(orders);
        } catch (error) {
            next(error);
        }
    };
}
