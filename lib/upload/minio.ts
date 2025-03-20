import * as Minio from 'minio';
import { nanoid } from 'nanoid';
import { fileTypeFromBuffer } from 'file-type';

// 初始化MinIO客户端
export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT ?? '',
  port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// 连接测试函数
export async function checkMinioConnection() {
  try {
    await minioClient.listBuckets();
    console.log('✅ MinIO connection established');
  } catch (error) {
    console.error('❌ MinIO connection failed:', error);
    throw new Error('Failed to connect to MinIO storage');
  }
}

// 通用文件上传函数
export async function uploadFile(bucketName: string, file: File) {
  const objectName = `${Date.now()}-${nanoid()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  // 使用文件二进制签名检测类型
  const typeResult = await fileTypeFromBuffer(buffer);
  const detectedType = typeResult?.mime || file.type;

  try {
    await minioClient.putObject(
      bucketName,
      objectName,
      buffer,
      buffer.byteLength,
      {
        'Content-Type': file.type,
        'Original-Filename': encodeURIComponent(file.name),
      },
    );
    return {
      filePtah: `${bucketName}/${objectName}`,
      fileSize: file.size,
      fileType: detectedType,
      fileExt: typeResult?.ext ?? null,
    };
  } catch (error) {
    console.error('MinIO upload failed:', error);
    throw new Error(`文件上传失败: ${(error as Error).message}`);
  }
}

// 初始化时检查连接（开发环境）
if (process.env.NODE_ENV !== 'production') {
  checkMinioConnection().catch(console.error);
}
