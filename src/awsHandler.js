const { BucketAlreadyExists } = require('@aws-sdk/client-s3');
const aws = require('aws-sdk');
const { AWS_ACCESS_ID, AWS_ACCESS_TOKEN } = require('./config');

class StorageHandler {
    constructor() {
        this.s3Client = new aws.S3({
            credentials: {
                accessKeyId: AWS_ACCESS_ID,
                secretAccessKey: AWS_ACCESS_TOKEN
            }
        });;
    }

    async createBucket(id) {
        let data = this.s3Client.createBucket({ Bucket: id }).promise();
        return data;
    }
    async listBuckets() {
        let data = await this.s3Client.listBuckets().promise()
        return data;
    }
    async listObjects(Bucket) {
        let r = await this.s3Client.listObjectsV2({ Bucket: Bucket }).promise();
        let x = r.Contents.map(item => item.Key);
        return x;
    }
    async putObject(id, file, name) {
        let params = {
            Bucket: `${id}`,
            Key: name,
            Body: file,
            ContentEncoding: 'base64',
            ContentType: '',
            ServerSideEncryption: 'AES256'
        };;
        let data = this.s3Client.putObject(params).promise()
        return data

    }

    async downloadObject(bucket, fileName) {
        let data = await s3.getObject({ Bucket: bucket, Key: fileName }).promise();
        return data;
    }

    async deleteObject(bucket, fileName) {
        let data = await s3.deleteObject({ Bucket: bucket, Key: fileName }).promise();
        return data;
    }
}


module.exports = { StorageHandler };