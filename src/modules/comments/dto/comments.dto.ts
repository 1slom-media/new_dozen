import {
    ArrayNotEmpty,
    IsArray,
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { IComment } from '../interface/comments.interface';

export class CreateCommentDto implements IComment {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    productId: any;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    @Max(5)
    @Min(1)
    rating: number;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    text: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    image?: string[];
}
export class CreateReplyDto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    text: string;

    @IsOptional()
    @IsString()
    @ArrayNotEmpty()
    images?: string[];
}

export class UpdateCommentDto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    productId: any;

    @IsOptional()
    @IsNumber()
    @Max(5)
    @Min(1)
    rating: number;

    @IsOptional()
    @IsString()
    text: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    image?: string[];
}
