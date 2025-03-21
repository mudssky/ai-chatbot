import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { embeddingModel } from '../models';
import { createHash } from 'node:crypto';

export const SplitParam = {
  chunkSize: 500,
  chunkOverlap: 50,
};
export const generateChunks = async (
  file: File,
  options?: {
    extName: string;
  },
) => {
  const input = await file.text();
  const splitter = new RecursiveCharacterTextSplitter(SplitParam);
  const splitDocs = await splitter.splitText(input);
  return splitDocs;
};
const generateChunksFromText = async (input: string) => {
  const splitter = new RecursiveCharacterTextSplitter(SplitParam);
  const splitDocs = await splitter.splitText(input);
  return splitDocs;
};

/**
 * 生成文本分块哈希
 * @param content 文本内容
 * @param metadata 元数据（包含页码、文件路径等）
 * @returns 64位十六进制哈希字符串
 */
export function generateChunkHash(input: string): string {
  const hash = createHash('sha256');
  // 标准化处理
  return hash.update(input.normalize('NFC')).digest('hex');
}

export async function generateEmbedding(value: string) {
  const e = await embeddingModel.embedQuery(value);
  return e;
}

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = await generateChunksFromText(value);
  const res: { embedding: number[]; content: string }[] = [];
  for (const chunk of chunks) {
    const e = await generateEmbedding(chunk);
    res.push({
      content: chunk,
      embedding: e,
    });
  }
  return res;
};
