import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/upload/minio';
import { withAuth } from '@/lib/auth/with-auth';
import { addKnowledgeDocument } from '@/lib/db/queries/knowledge-base';
const BUCKET_NAME = process.env.MINIO_PROJECT_BUCKET ?? '';
export const POST = withAuth(async ({ request, userId }) => {
  try {
    const formData = await request?.formData();
    if (!formData) {
      return NextResponse.json({ error: '参数不正确' }, { status: 400 });
    }
    const file = formData.get('file') as File;
    const knowledgeBaseId = formData.get('knowledgeBaseId') as string;

    // 验证文件有效性
    if (!file || file.size === 0) {
      return NextResponse.json({ error: '无效的文件' }, { status: 400 });
    }

    const allowExts = ['pdf', 'txt', 'md'];
    const fileExtension = file.name.split('.').pop() ?? '';
    if (!allowExts.includes(fileExtension?.toLowerCase())) {
      return NextResponse.json({ error: '不支持的文件格式' }, { status: 400 });
    }

    const res = await uploadFile(BUCKET_NAME, file);
    const addRes = await addKnowledgeDocument({
      knowledgeBaseId,
      fileName: file.name,
      filePath: res.filePtah,
      fileType: res.fileType,
      fileSize: res.fileSize,
      chunkSize: null,
      chunkOverlap: null,
      chunkCount: null,
      storageType: 'minio',
      fileExt: res.fileExt,
    });

    return addRes;
  } catch (error) {
    console.error('[KNOWLEDGE_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { error: '文件上传失败，请稍后重试' },
      { status: 500 },
    );
  }
});
