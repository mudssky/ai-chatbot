'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { KnowledgeBase, KnowledgeDocument } from '@/lib/db/schema';
import { message, Upload, type UploadProps } from 'antd';
import { useEffect, useState } from 'react';
import { confirm } from '@/components/confirm';
import { DocumentListItem } from './document-list-item';

type UploadAreaProps = {
  selectedKnowledgeBase: KnowledgeBase | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function UploadArea({
  selectedKnowledgeBase,
  onFileUpload,
}: UploadAreaProps) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    if (!selectedKnowledgeBase?.id) return;
    try {
      setLoading(true);
      const response = await fetch(
        `/api/knowledge-base/document?knowledgeBaseId=${selectedKnowledgeBase.id}`,
      );
      if (!response.ok) throw new Error('获取文档列表失败');
      const data = await response.json();
      setDocuments(data.data || []);
    } catch (error) {
      console.error('获取文档列表失败:', error);
      message.error('获取文档列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedKnowledgeBase?.id]);

  const handleDelete = async (document: KnowledgeDocument) => {
    await confirm({
      title: `确定要删除文件 ${document.fileName} 吗？`,
      async onOk() {
        try {
          const response = await fetch(
            `/api/knowledge-base/document?documentId=${document.id}`,
            { method: 'DELETE' },
          );
          if (!response.ok) throw new Error('删除失败');
          message.success('删除成功');
          await fetchDocuments();
        } catch (error) {
          console.error('删除文件失败:', error);
          message.error('删除文件失败');
        }
      },
    });
  };
  const props: UploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: true,
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
        message.success('文件上传成功');
        await fetchDocuments();
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
              {loading ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  加载中...
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {documents.map((doc) => (
                    <DocumentListItem
                      key={doc.id}
                      document={doc}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  暂无文件
                </div>
              )}
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
