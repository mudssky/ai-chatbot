'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

type KnowledgeBase = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
};

export function KnowledgeBaseConfig() {
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<
    string | null
  >(null);
  const [newKnowledgeBaseName, setNewKnowledgeBaseName] = useState('');
  const [newKnowledgeBaseDescription, setNewKnowledgeBaseDescription] =
    useState('');
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: '1',
      name: '示例知识库',
      description: '这是一个示例知识库',
      createdAt: new Date(),
    },
  ]);

  const handleAddKnowledgeBase = () => {
    if (!newKnowledgeBaseName.trim()) return;

    const newKnowledgeBase: KnowledgeBase = {
      id: Date.now().toString(),
      name: newKnowledgeBaseName,
      description: newKnowledgeBaseDescription,
      createdAt: new Date(),
    };

    setKnowledgeBases([...knowledgeBases, newKnowledgeBase]);
    setNewKnowledgeBaseName('');
    setNewKnowledgeBaseDescription('');
    setSelectedKnowledgeBase(newKnowledgeBase.id);
  };

  const handleSelectKnowledgeBase = (id: string) => {
    setSelectedKnowledgeBase(id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 处理文件上传逻辑
    console.log('Files uploaded:', e.target.files);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 左侧：知识库列表和添加功能 */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>知识库列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {knowledgeBases.map((kb) => (
                <div
                  key={kb.id}
                  className={`p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${selectedKnowledgeBase === kb.id ? 'bg-muted' : ''}`}
                  onClick={() => handleSelectKnowledgeBase(kb.id)}
                >
                  <div className="font-medium">{kb.name}</div>
                  {kb.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {kb.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    创建时间: {kb.createdAt.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>新增知识库</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kb-name">知识库名称</Label>
              <Input
                id="kb-name"
                placeholder="请输入知识库名称"
                value={newKnowledgeBaseName}
                onChange={(e) => setNewKnowledgeBaseName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kb-description">知识库描述</Label>
              <Input
                id="kb-description"
                placeholder="请输入知识库描述（可选）"
                value={newKnowledgeBaseDescription}
                onChange={(e) => setNewKnowledgeBaseDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAddKnowledgeBase}
              disabled={!newKnowledgeBaseName.trim()}
            >
              <span className="mr-2">
                <PlusIcon />
              </span>
              添加知识库
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 右侧：文件上传区域 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedKnowledgeBase
                ? `${knowledgeBases.find((kb) => kb.id === selectedKnowledgeBase)?.name} - 文件管理`
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
                      onChange={handleFileUpload}
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
      </div>
    </div>
  );
}
