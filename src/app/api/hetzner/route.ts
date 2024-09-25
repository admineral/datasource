import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    }

    const s3Client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true,
    });

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        const uploadParams = {
          Bucket: 'datasource',
          Key: file.name,
          Body: fileBuffer,
          ContentType: file.type || 'application/octet-stream',
        };

        const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
        return { fileName: file.name, result: uploadResult };
      })
    );

    return NextResponse.json({
      message: 'Files uploaded successfully!',
      data: uploadResults,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'File upload failed.' }, { status: 500 });
  }
}