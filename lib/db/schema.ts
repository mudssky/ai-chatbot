import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
  vector,
  index,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      name: 'suggestion_document_fk',
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const knowledgeBase = pgTable('KnowledgeBase', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
});

export type KnowledgeBase = InferSelectModel<typeof knowledgeBase>;

export const knowledgeDocument = pgTable('KnowledgeDocument', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  knowledgeBaseId: uuid('knowledgeBaseId')
    .notNull()
    .references(() => knowledgeBase.id),
  fileName: text('fileName').notNull(),
  filePath: text('filePath').notNull(),
  fileType: varchar('fileType', { length: 32 }).notNull(), //存储MIME类型
  fileExt: varchar('fileExt', { length: 10 }), // 新增扩展名字段（可选）
  fileSize: integer('fileSize').notNull(),
  chunkSize: integer('chunkSize').default(0),
  chunkOverlap: integer('chunkOverlap').default(0),
  chunkCount: integer('chunkCount').default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  // 新增存储信息字段
  storageType: varchar('storage_type', {
    length: 20,
    enum: ['minio', 'oss', 's3', 'local'],
  })
    .notNull()
    .default('minio'),
});

export const knowledgeChunk = pgTable(
  'KnowledgeChunk',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    documentId: uuid('documentId')
      .notNull()
      .references(() => knowledgeDocument.id),
    content: text('content').notNull(),
    metadata: json('metadata').notNull(),
    vector: vector('embedding', { dimensions: 1024 }).notNull(),
    chunkHash: text('chunk_hash'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
    isProcessed: boolean('is_processed'), // 是否完成向量化
    processingError: text('processing_error'), // 处理异常信息
  },
  // 创建索引
  (table) => [index('chunk_hash_idx').on(table.chunkHash)],
);

export type KnowledgeDocument = InferSelectModel<typeof knowledgeDocument>;
