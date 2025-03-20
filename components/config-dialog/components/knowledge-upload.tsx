'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { KnowledgeBase } from '@/lib/db/schema';
import { message, Upload, type UploadProps } from 'antd';
type UploadAreaProps = {
  selectedKnowledgeBase: KnowledgeBase | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function UploadArea({
  selectedKnowledgeBase,
  onFileUpload,
}: UploadAreaProps) {
  const props: UploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    async beforeUpload(file, fileList) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('knowledgeBaseId', selectedKnowledgeBase?.id || '');

      try {
        const response = await fetch('/api/knowledge-base/document', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error(await response.text());

        return false;
      } catch (error) {
        message.error(`文件上传失败: ${(error as any).message}`);
        throw error;
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedKnowledgeBase
            ? `${selectedKnowledgeBase.name} - 文件管理`
            : '请先选择知识库'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedKnowledgeBase ? (
          <div className="space-y-6">
            <Upload.Dragger {...props}>
              <div className="rounded-lg p-12 text-center hover:border-muted-foreground/50 transition-colors">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-muted-foreground">
                    拖拽文件到此处或点击下方按钮上传
                  </div>
                  <Button>选择文件</Button>
                  <div className="text-xs text-muted-foreground">
                    支持 PDF、Word、TXT 等文档格式
                  </div>
                </div>
              </div>
            </Upload.Dragger>
            <div>
              <h3 className="text-sm font-medium mb-2">已上传文件</h3>
              <Separator className="mb-4" />
              <div className="text-sm text-muted-foreground text-center py-8">
                暂无文件
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            请先从左侧选择一个知识库
          </div>
        )}
      </CardContent>
    </Card>
  );
}
