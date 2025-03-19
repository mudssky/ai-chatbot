import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { createRoot } from 'react-dom/client';

export interface ConfirmOptions
  extends Pick<
    React.ComponentProps<typeof AlertDialog>,
    'open' | 'onOpenChange'
  > {
  title?: React.ReactNode;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  okButtonProps?: React.ComponentProps<typeof AlertDialogAction>;
  cancelButtonProps?: React.ComponentProps<typeof AlertDialogCancel>;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  content,
  okText = '确认',
  cancelText = '取消',
  okButtonProps,
  cancelButtonProps,
  className,
  onOk,
  onCancel,
}: ConfirmOptions & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn('w-[95vw] max-w-md rounded-lg', className)}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {content && (
            <AlertDialogDescription>{content}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel {...cancelButtonProps} onClick={onCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction {...okButtonProps} onClick={onOk}>
            {okText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        root.unmount();
        container.remove();
      }
    };

    const handleCancel = () => {
      options.onCancel?.();
      resolve(false);
    };

    const handleConfirm = async () => {
      try {
        await options.onOk?.();
        resolve(true);
      } catch (error) {
        resolve(false);
      } finally {
        root.unmount();
        container.remove();
      }
    };

    const root = createRoot(container);
    root.render(
      <ConfirmDialog
        open={true}
        onOpenChange={handleOpenChange}
        {...options}
        onOk={handleConfirm}
        onCancel={handleCancel}
      />,
    );
  });
}
