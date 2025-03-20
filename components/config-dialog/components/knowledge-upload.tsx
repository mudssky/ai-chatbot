'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { KnowledgeBase } from '@/lib/db/schema';

type UploadAreaProps = {
  selectedKnowledgeBase: KnowledgeBase | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function UploadArea({
  selectedKnowledgeBase,
  onFileUpload,
}: UploadAreaProps) {
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
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-muted-foreground/50 transition-colors">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-muted-foreground">
                  拖拽文件到此处或点击下方按钮上传
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={onFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline">选择文件</Button>
                </label>
                <div className="text-xs text-muted-foreground">
                  支持 PDF、Word、TXT 等文档格式
                </div>
              </div>
            </div>

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
