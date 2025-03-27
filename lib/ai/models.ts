import { OllamaEmbeddings } from '@langchain/ollama';

export const DEFAULT_CHAT_MODEL: string = 'deepseek-chat';

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'deepseek-chat',
    name: 'deepseek chat',
    description: 'deepseek chat v3',
  },
  {
    id: 'deepseek-reasoner',
    name: 'deepseek R1',
    description: 'deepseek reasoning 1',
  },
  {
    id: 'deepseek-r1:1.5b',
    name: 'deepseek r1:1.5b',
    description: 'deepseek reasoning 1:1.5b',
  },
  // {
  //   id: 'chat-model-reasoning',
  //   name: 'Reasoning model',
  //   description: 'Uses advanced reasoning',
  // },
];

export const embeddingModel = new OllamaEmbeddings({
  model: 'bge-m3',
  baseUrl: 'http://localhost:11434', // Default value
});
