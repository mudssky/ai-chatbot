"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfigDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[60vw] size-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>配置</DialogTitle>
          <DialogDescription>在这里管理你的应用配置。</DialogDescription>
        </DialogHeader>
        <div className="py-6">{/* 这里可以添加配置项 */}</div>
        {/* <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">关闭</Button>
          </DialogClose>
          <Button type="submit">保存</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
