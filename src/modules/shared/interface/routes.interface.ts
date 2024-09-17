import { Router, Request } from 'express';
import { IUser } from 'modules/user/interface/user.interface';

export interface Routes {
    path?: string;
    router: Router;
}

export interface RequestWithUser extends Request {
    user?: IUser;
}
