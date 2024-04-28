import { S3 } from 'aws-sdk';
import { nanoid } from 'nanoid';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export default class FileUpload {
  public readonly s3: S3;
  private static instance: S3 | null = null;

  constructor() {
    if (!FileUpload.instance) {
      this.s3 = new S3({
        signatureVersion: 'v4',
      });
      FileUpload.instance = this.s3;
    } else {
      this.s3 = FileUpload.instance;
    }
  }

  async getSignedUrlForUpload(
    key: string,
    originalFileName: string,
    contentType: string,
    acl: string,
  ) {
    console.log('key', key, originalFileName, contentType);
    const params = {
      Bucket: (process.env.AWS_S3_BUCKET as string) || 'my-bucket',
      Key: key,
      Expires: 60 * 60 * 24 * 7,
      ContentType: contentType,
      ACL: 'public-read',
      Metadata: {
        id: nanoid(),
        uniqueFileName: key,
        originalFileName: originalFileName,
        contentType: contentType,
      },
    };

    return await this.s3.getSignedUrlPromise('putObject', params);
  }

  async getSignedUrlForDownload(key: string) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET as string,
      Key: key,
      Expires: 60 * 60 * 24 * 7,
    };

    return await this.s3.getSignedUrlPromise('getObject', params);
  }

  upload() {
    // TODO: Implement upload method
  }
}
