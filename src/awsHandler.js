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
        this.s3Client.createBucket({ Bucket: id + "-cc-non-guided-project" }, function (err, data) {
            if (err) {
                return err;
            } else {
                return data.Buckets;
            }
        });

    }
    async listBuckets() {
        let data = await this.s3Client.listBuckets().promise()
        return data;
    }

    async putObject(id,file) {
        console.log(`${id}-cc-non-guided-project`)
        let params = {
            Bucket: `${id}-cc-non-guided-project`,
            Key: 'file',
            Body: file,
            ContentEncoding: 'base64',
            ContentType: '',
            ServerSideEncryption: 'AES256'
        };;
        let data = this.s3Client.putObject(params).promise()
        return data

    }
}


module.exports = { StorageHandler };