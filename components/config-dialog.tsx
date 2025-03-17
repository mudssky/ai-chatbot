'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function ConfigDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>配置</AlertDialogTitle>
          <AlertDialogDescription>
            在这里管理你的应用配置。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-6">
          {/* 这里可以添加配置项 */}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>关闭</AlertDialogCancel>
          <Button type="submit">保存</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}