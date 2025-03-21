'use client';

import * as React from 'react';
import { AsyncButton } from '@/components/AsyncButton';
import dayjs from 'dayjs';
import type { KnowledgeDocument } from '@/lib/db/schema';
import { Space } from 'antd';
import { ProgressIcon } from './progress-icon';

type DocumentListItemProps = {
  document: KnowledgeDocument;
  onDelete: (document: KnowledgeDocument) => Promise<void>;
};

export function DocumentListItem({
  document,
  onDelete,
}: DocumentListItemProps) {
  return (
    <div
      key={document.id}
      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
    >
      <div className="space-y-1">
        <div className="text-sm font-medium">{document.fileName}</div>
        <div className="text-xs text-muted-foreground">
          上传时间: {dayjs(document.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          <span className="mx-2">•</span>
          分片数: {document.chunkCount}
        </div>
      </div>
      <Space>
        <ProgressIcon status={'failed'} />
        <AsyncButton
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive/80"
          onClick={() => onDelete(document)}
        >
          删除
        </AsyncButton>{' '}
      </Space>
    </div>
  );
}
