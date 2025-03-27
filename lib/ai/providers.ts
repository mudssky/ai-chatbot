import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { deepseek } from '@ai-sdk/deepseek';
import { ollama } from 'ollama-ai-provider';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'deepseek-chat': chatModel,
        'deepseek-reasoner': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'deepseek-chat': deepseek('deepseek-chat'),
        'deepseek-reasoner': wrapLanguageModel({
          model: deepseek('deepseek-reasoner'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        // 'chat-model-reasoning': wrapLanguageModel({
        //   model: fireworks('accounts/fireworks/models/deepseek-r1'),
        //   middleware: extractReasoningMiddleware({ tagName: 'think' }),
        // }),
        'title-model': deepseek('deepseek-chat'),
        // 'artifact-model': openai('gpt-4o-mini'),
        'deepseek-r1:1.5b': ollama('deepseek-r1:1.5b'),
        // 'deepseek-r1:1.5b': wrapLanguageModel({
        //   model: ollama('deepseek-r1:1.5b'),
        //   middleware: extractReasoningMiddleware({ tagName: 'think' }),
        // }),
      },
      imageModels: {
        'small-model': openai.image('dall-e-2'),
        'large-model': openai.image('dall-e-3'),
      },
    });
