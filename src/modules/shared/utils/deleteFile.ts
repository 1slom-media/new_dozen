import { aws } from './../../../config/conf';
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';

AWS.config.update({ region: 'eu-west-3' });

const s3 = new S3({
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey,
    region: 'eu-west-3',
});

export const deleteFile = async (files: any, folder: string = 'images') => {
    try {
        if (Array.isArray(files)) {
            for await (const file of files) {
            }
        } else {
        }
    } catch (e) {
        console.log(e.message);
    }
};
