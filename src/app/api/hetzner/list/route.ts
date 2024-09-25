import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const s3Client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true,
    });

    const listParams = {
      Bucket: 'datasource',
    };

    const data = await s3Client.send(new ListObjectsV2Command(listParams));

    const files = data.Contents?.map(item => ({
      name: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
    })) || [];

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}