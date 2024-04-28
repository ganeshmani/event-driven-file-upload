import { Handler, S3Event, Context, Callback } from 'aws-lambda';
import AWS from 'aws-sdk';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'; // ES Modules import
import DBClient from './lib/DynamoDB/aws-dynamodb';
import { nanoid } from 'nanoid';
import fetch from 'node-fetch';
const s3 = new S3Client({ region: 'us-east-1' });

const awsS3 = new AWS.S3({
  region: 'us-east-1',
});

export const handler: Handler<S3Event, Context> = (
  event: S3Event,
  context: Context,
  callback: Callback,
) => {
  console.log('Event: ', JSON.stringify(event, null, 2));
  console.log('before event eorr', event.Records === null);
  if (event.Records === null) {
    console.log('event.Records === null', event.Records === null);

    const error = new Error('No records found');
    callback(error);
    return;
  }

  const s3Record = event.Records[0].s3;
  const bucketName = s3Record.bucket.name;

  // const s3 = new AWS.S3();

  const key = s3Record.object.key;

  // remove the + from the key if it's added by S3
  const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));

  const headObjectParams = {
    Bucket: bucketName,
    Key: decodedKey,
  };

  awsS3
    .headObject(headObjectParams)
    .promise()
    .then(async (headObjectResponse) => {
      const customMetadata = headObjectResponse.Metadata;

      const originalFileName = customMetadata?.originalfilename;
      const uniqueFileName = customMetadata?.uniquefilename;
      const contentType = customMetadata?.contenttype;

      const dbClient = new DBClient();

      const insertResponse = await dbClient.create(
        {
          id: nanoid(),
          uniqueFileName: uniqueFileName,
          originalFileName: originalFileName,
          contentType: contentType,
          createdAt: new Date().toISOString(),
        },
        'files',
      );

      // if (insertResponse === null) {
      //   const error = new Error('Error inserting record');
      //   callback(error);
      //   return;
      // }

      console.log('insertResponse', insertResponse);
      console.log('process.env.TINYBIRD_API_KEY', process.env.TINYBIRD_API_KEY);

      const response = await fetch(
        'https://api.us-east.aws.tinybird.co/v0/events?name=file_uploaded_success',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.TINYBIRD_API_KEY}`,
          },
          body: JSON.stringify({
            id: insertResponse?.id,
            uniqueFileName,
            originalFileName,
            contentType,
          }),
        },
      );

      const data = await response.json();
    })
    .catch((error) => {
      console.error('Error coming from headobject: ', error);
      callback(error);
    });

  // console.log("Event: ", JSON.stringify(event, null, 2));

  // callback(null, "Success");
};
