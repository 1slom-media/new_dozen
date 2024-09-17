export interface ICategory {
    uid: number;
    title: { uz: string; en: string; ru: string };
    adult?: boolean;
    avatar?: string;
    parent?: number;
}

export interface ICreateCategory {
    title: { uz: string; en: string; ru: string };
    adult?: boolean;
    avatar?: string;
}
