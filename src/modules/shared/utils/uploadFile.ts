import ErrorResponse from './errorResponse';
import { aws } from './../../../config/conf';
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';

AWS.config.update({ region: 'eu-north-1' });

const s3 = new S3({
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey,
    region: 'eu-north-1',
});

// const uploadFile = async (files: any, folder: string = 'images') => {
//     try {
//         const arr = [];
//         if (Array.isArray(files)) {
//             for (const file of files) {
//                 const ext = file['mimetype'].split('/')[1];
//                 const fileName = main_url + uuidv4() + '.' + ext;
//                 file.mv(
//                     path.join(
//                         __dirname,
//                         '..',
//                         '..',
//                         '..',
//                         '..',
//                         'public',
//                         'uploads',
//                         folder,
//                         fileName
//                     )
//                 );
//                 const f = {
//                     name: file.name,
//                     src: fileName,
//                     size: file.size,
//                     ext: ext,
//                     mimetype: file.mimetype,
//                 };
//                 arr.push(f.src);
//             }
//         } else {
//             const ext = files['mimetype'].split('/')[1];
//             const fileName = main_url + uuidv4() + '.' + ext;
//             files.mv(
//                 path.join(
//                     __dirname,
//                     '..',
//                     '..',
//                     '..',
//                     '..',
//                     'public',
//                     'uploads',
//                     folder,
//                     fileName
//                 )
//             );
//             const f = {
//                 name: files.name,
//                 src: fileName,
//                 size: files.size,
//                 ext: ext,
//                 mimetype: files.mimetype,
//             };
//             arr.push(f.src);
//         }

//         return arr;
//     } catch (e) {
//         throw new ErrorResponse(
//             500,
//             'File boshqa nom ostida yuborilgan bolishi mumkin'
//         );
//     }
// };

export const uploadFile = async (files: any, folder: string = 'images') => {
    try {

        const arr = [];
        if (Array.isArray(files)) {
            for await (const file of files) {
                let image = new Promise((resolve, reject) => {
                    fs.readFile(file.tempFilePath, async (err, uploadData) => {
                        let uploadParams = {
                            Bucket: 'dozen-colelction',
                            Key: file.name,
                            Body: uploadData,
                            ContentType: file.mimetype,
                            ACL: 'public-read',
                        };
                        resolve(
                            (await s3.upload(uploadParams).promise()).Location
                        );
                    });
                });
                arr.push(image);
            }
        } else {
            let image = new Promise((resolve, reject) => {
                fs.readFile(files.tempFilePath, async (err, uploadData) => {
                    let uploadParams = {
                        Bucket: 'dozen-colelction',
                        Key: files.name,
                        Body: uploadData,
                        ContentType: files.mimetype,
                        ACL: 'public-read',
                    };
                    resolve((await s3.upload(uploadParams).promise()).Location);
                });
            });
            arr.push(image);
        }

        return await Promise.all(arr);
    } catch (e) {
        throw new ErrorResponse(
            500,
            'File boshqa nom ostida yuborilgan bolishi mumkin'
        );
    }
};

export const uploadFileForBot = async (files: any) => {
    try {
        console.log(files);

        let image = new Promise(async (resolve, reject) => {
            let uploadParams = {
                Bucket: 'dozen-colelction',
                Key: files.name,
                Body: files.uploadData,
            };
            resolve((await s3.upload(uploadParams).promise()).Location);
        });
        return image;
    } catch (e) {
        throw new ErrorResponse(
            500,
            'File boshqa nom ostida yuborilgan bolishi mumkin'
        );
    }
};
