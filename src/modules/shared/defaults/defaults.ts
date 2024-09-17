import { IUser } from '../../user/interface/user.interface';
import { IDefaultQuery } from '../interface/query.interface';

export const defaultQueryValues: IDefaultQuery = {
    limit: 10,
    page: 1,
};

export const defaultAdminValues: IUser = {
    name: 'admin',
    phone: '+998949354411',
    isAdmin: true,
};

export const defaults = {
    passwordLength: 6,
    reqImagesName: 'images',
    reqFilesName: 'files',
    passwordMessage: (password) => {
        return `Sizning maxfiylik parolingiz: ${password} \n Uni keyinchalik o'zgartirishingiz mumkin.`;
    },
};

export const defaultRangeSplitter: string = 'and';
export const defaultRequestImagesName: string = 'images';
export const defaultRequestCoverImageName: string = 'cover';
export const defaultRequestFilesName: string = 'files';
