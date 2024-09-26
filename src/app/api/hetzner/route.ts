import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('Received upload request');
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    console.log(`Number of files received: ${files.length}`);

    if (files.length === 0) {
      console.log('No files uploaded');
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

    console.log('S3 client initialized');

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        console.log(`Processing file: ${file.name}`);
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        const uploadParams = {
          Bucket: 'datasource',
          Key: file.name,
          Body: fileBuffer,
          ContentType: file.type || 'application/octet-stream',
        };

        console.log(`Uploading file: ${file.name}`);
        const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`File uploaded successfully: ${file.name}`);
        return { fileName: file.name, result: uploadResult };
      })
    );

    console.log('All files processed');

    return NextResponse.json({
      message: 'Files uploaded successfully!',
      data: uploadResults,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'File upload failed.', 
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}