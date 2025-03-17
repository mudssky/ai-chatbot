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
  // {
  //   id: 'chat-model-reasoning',
  //   name: 'Reasoning model',
  //   description: 'Uses advanced reasoning',
  // },
];
