import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Missing fileName or fileType.' }, { status: 400 });
    }

    const s3Client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!,
        secretAccessKey: process.env.MINIO_SECRET_KEY!,
      },
      forcePathStyle: true,
    });

    const command = new PutObjectCommand({
      Bucket: 'datasource',
      Key: encodeURIComponent(fileName),
      ContentType: fileType,
    });

    // Generate a presigned URL valid for 15 minutes (900 seconds)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return NextResponse.json({ url: presignedUrl });
  } catch (error: any) {
    console.error('Presign error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL.', details: error.message },
      { status: 500 }
    );
  }
}