import serverless from 'serverless-http';
import express, { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import cors from 'cors';

import FileUpload from './lib/file-upload';
import DBClient from './lib/DynamoDB/aws-dynamodb';

const app = express();

app.get('/', async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({
    message: 'Hello from data!',
  });
});

app.get(
  '/files/:id/download',
  async (req: Request, res: Response, next: NextFunction) => {
    const dbClient = new DBClient();
    const id = req.params.id;

    if (id === undefined) {
      return res.status(400).json({
        error: 'Missing id',
      });
    }

    const file = await dbClient.get('files', 'id', id);

    if (file === null || !file) {
      return res.status(404).json({
        error: 'File not found',
      });
    }

    const fileUpload = new FileUpload();

    const url = await fileUpload.getSignedUrlForDownload(file.uniqueFileName);

    return res.status(200).json({
      url,
    });
  },
);

app.delete(
  '/files/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const dbClient = new DBClient();
    const id = req.params.id;
    console.log('id', id);

    if (id === undefined) {
      return res.status(400).json({
        error: 'Missing id',
      });
    }

    const response = await dbClient.delete(id);

    return res.status(200).json(response);
  },
);

app.get('/files', async (req: Request, res: Response, next: NextFunction) => {
  const dbClient = new DBClient();
  const files = await dbClient.getAllFiles();

  if (files === null || !files) {
    return res.status(200).json([]);
  }

  // order files by createdAt
  files.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return res.status(200).json(files);
});

app.post(
  '/get-url',
  async (req: Request, res: Response, next: NextFunction) => {
    const request = JSON.parse(req.body);

    if (request.file_name === undefined) {
      return res.status(400).json({
        error: 'Missing file_name',
      });
    }

    const fileName = request.file_name;
    const contentType = request.content_type;

    const uniqueFileName = `${nanoid()}-${fileName}`;

    const fileUpload = new FileUpload();

    const url = await fileUpload.getSignedUrlForUpload(
      uniqueFileName,
      fileName,
      contentType,
      'public-read',
    );

    return res
      .header({
        'Access-Control-Allow-Origin': '*',
      })
      .status(200)
      .json({
        url,
      });
  },
);

app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});

export const handler = serverless(app);
