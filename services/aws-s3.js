const AWS = require("aws-sdk");

exports.uploadToS3 = (fileName, data) => {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    const s3Bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET
    });
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: "public-read"
    };
    return new Promise((res, rej) => {
        s3Bucket.upload(params, (err, file) => {
            if (err) {
                rej("Couldn't upload file");
            };
            res(file.Location)
        });
    });
};