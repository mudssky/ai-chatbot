import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { embeddingModel } from '../models';

export const SplitParam = {
  chunkSize: 500,
  chunkOverlap: 50,
};
export const generateChunks = async (input: string) => {
  const splitter = new RecursiveCharacterTextSplitter(SplitParam);
  const splitDocs = await splitter.splitText(input);
  return splitDocs;
};

async function generateEmbedding(value: string) {
  const e = await embeddingModel.embedQuery(value);
  return e;
}

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = await generateChunks(value);
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
