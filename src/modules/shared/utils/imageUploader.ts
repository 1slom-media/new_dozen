import { aws } from './../../../config/conf';
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import sharp from 'sharp';
import generateRandomString from './randomStringGenerator';
import { ProductImage } from '../../product/interface/product.interface';
import ErrorResponse from './errorResponse';

AWS.config.update({ region: 'eu-north-1' });

const s3 = new S3({
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey,
    region: 'eu-north-1',
});

export async function imageUploader(files: any) {
    try {
        const response: ProductImage[] = [];

        if (Array.isArray(files)) {
            for await (const file of files) {
                var image: ProductImage = {
                    image: {
                        '800': { high: '', low: '' },
                        '720': { high: '', low: '' },
                        '540': { high: '', low: '' },
                        '240': { high: '', low: '' },
                        '80': { high: '', low: '' },
                    },
                    imageKey: '',
                    color: null,
                    hasVerticalPhoto: false,
                };

                const sizes = [
                    { width: 600, height: 800 },
                    { width: 540, height: 720 },
                    { width: 405, height: 540 },
                    { width: 180, height: 240 },
                    { width: 60, height: 80 },
                ];

                const highQuality = 95;
                const lowQuality = 40;

                const uniqueKey = generateRandomString(20);
                image.imageKey = uniqueKey;
                for await (const size of sizes) {
                    await new Promise((resolve, reject) => {
                        fs.readFile(
                            file.tempFilePath,
                            async (err, uploadData) => {
                                console.log(uploadData);

                                let chunk = new Promise(async (res, _) => {
                                    const highQualityImage = await sharp(
                                        uploadData
                                    )
                                        .resize({
                                            width: size.width,
                                            height: size.height,
                                        })
                                        .jpeg({ quality: highQuality })
                                        .toBuffer();

                                    let highQualityImageParams = {
                                        Bucket: 'dozen-colelction',
                                        Key: `${uniqueKey}/t_product_${size.height}_high.jpg`,
                                        Body: highQualityImage,
                                        ContentType: 'image/jpeg',
                                        ACL: 'public-read',
                                    };
                                    const lowQualityImage = await sharp(
                                        uploadData
                                    )
                                        .resize({
                                            width: size.width,
                                            height: size.height,
                                        })
                                        .jpeg({ quality: lowQuality })
                                        .toBuffer();

                                    let lowQualityImageParams = {
                                        Bucket: 'dozen-colelction',
                                        Key: `${uniqueKey}/t_product_${size.height}_low.jpg`,
                                        Body: lowQualityImage,
                                        ContentType: 'image/jpeg',
                                        ACL: 'public-read',
                                    };
                                    res({
                                        high: (
                                            await s3
                                                .upload(highQualityImageParams)
                                                .promise()
                                        ).Location,
                                        low: (
                                            await s3
                                                .upload(lowQualityImageParams)
                                                .promise()
                                        ).Location,
                                    });
                                });

                                chunk.then(({ high, low }) => {
                                    console.log(high);
                                    image.image[`${size.height}`].high = high;
                                    image.image[`${size.height}`].low = low;

                                    resolve('success');
                                });
                            }
                        );
                    });
                }

                response.push(image);
            }
        } else {
            var image: ProductImage = {
                image: {
                    '800': { high: '', low: '' },
                    '720': { high: '', low: '' },
                    '540': { high: '', low: '' },
                    '240': { high: '', low: '' },
                    '80': { high: '', low: '' },
                },
                imageKey: '',
                color: null,
                hasVerticalPhoto: false,
            };

            const sizes = [
                { width: 600, height: 800 },
                { width: 540, height: 720 },
                { width: 405, height: 540 },
                { width: 180, height: 240 },
                { width: 60, height: 80 },
            ];

            const highQuality = 95;
            const lowQuality = 40;

            const uniqueKey = generateRandomString(20);
            image.imageKey = uniqueKey;
            for await (const size of sizes) {
                await new Promise((resolve, reject) => {
                    fs.readFile(files.tempFilePath, async (err, uploadData) => {
                        let chunk = new Promise(async (res, _) => {
                            const highQualityImage = await sharp(uploadData)
                                .resize({
                                    width: size.width,
                                    height: size.height,
                                })
                                .jpeg({ quality: highQuality })
                                .toBuffer();

                            let highQualityImageParams = {
                                Bucket: 'dozen-colelction',
                                Key: `${uniqueKey}/t_product_${size.height}_high.jpg`,
                                Body: highQualityImage,
                                ContentType: 'image/jpeg',
                                ACL: 'public-read',
                            };
                            const lowQualityImage = await sharp(uploadData)
                                .resize({
                                    width: size.width,
                                    height: size.height,
                                })
                                .jpeg({ quality: lowQuality })
                                .toBuffer();

                            let lowQualityImageParams = {
                                Bucket: 'dozen-colelction',
                                Key: `${uniqueKey}/t_product_${size.height}_low.jpg`,
                                Body: lowQualityImage,
                                ContentType: 'image/jpeg',
                                ACL: 'public-read',
                            };
                            res({
                                high: (
                                    await s3
                                        .upload(highQualityImageParams)
                                        .promise()
                                ).Location,
                                low: (
                                    await s3
                                        .upload(lowQualityImageParams)
                                        .promise()
                                ).Location,
                            });
                        });

                        chunk.then(({ high, low }) => {
                            image.image[`${size.height}`].high = high;
                            image.image[`${size.height}`].low = low;

                            resolve('success');
                        });
                    });
                });
            }

            response.push(image);
        }

        return response;
    } catch (e) {
        throw new ErrorResponse(
            500,
            'File boshqa nom ostida yuborilgan bolishi mumkin'
        );
    }
}

export async function videoUploader(file: any) {
    try {
        return await new Promise((resolve, reject) => {
            fs.readFile(file.tempFilePath, async (err, uploadData) => {
                const uniqueKey = generateRandomString(20);

                let videoParams = {
                    Bucket: 'dozen-colelction',
                    Key: `${uniqueKey}/t_product_video.${
                        file.mimetype.split('/')[1]
                    }`,
                    Body: uploadData,
                    ContentType: file.mimetype,
                    ACL: 'public-read',
                };

                const chunk = (await s3.upload(videoParams).promise()).Location;

                const data = await Promise.all([chunk]);
                resolve(data[0]);
            });
        });
    } catch (err) {}
}
