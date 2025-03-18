'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { KnowledgeBaseConfig } from './components/knowledge-base';

export function ConfigDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[60vw] size-full max-h-[85vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>配置</DialogTitle>
          <DialogDescription>在这里管理你的应用配置。</DialogDescription>
          <Tabs defaultValue="knowledge-base" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="knowledge-base">知识库配置</TabsTrigger>
              <TabsTrigger value="general">通用设置</TabsTrigger>
            </TabsList>
            <TabsContent value="knowledge-base" className="mt-6">
              <KnowledgeBaseConfig />
            </TabsContent>
            <TabsContent value="general" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>通用设置</CardTitle>
                  <CardDescription>
                    配置界面主题和语言等通用选项
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">界面主题</Label>
                    <Select>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="选择界面主题" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">浅色</SelectItem>
                        <SelectItem value="dark">深色</SelectItem>
                        <SelectItem value="system">跟随系统</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">界面语言</Label>
                    <Select>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="选择界面语言" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>保存通用设置</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
