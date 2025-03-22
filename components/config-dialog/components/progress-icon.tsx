import { Tooltip } from 'antd';
import { Clock, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export interface ProgressIconProps {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  className?: string;
}

export function ProgressIcon({
  status = 'pending',
  className,
}: ProgressIconProps) {
  const iconClasses = `h-6 w-6 ${className || ''}`;

  switch (status) {
    case 'pending':
      return <Clock className={iconClasses} />;
    case 'processing':
      return <Loader2 className={`${iconClasses} animate-spin`} />;
    case 'completed':
      return <CheckCircle className={`${iconClasses} text-green-600`} />;
    case 'failed':
      return (
        <Tooltip title="存在执行失败的分片">
          <AlertTriangle className={`${iconClasses} text-yellow-600`} />
        </Tooltip>
      );
    default:
      return <Loader2 className={`${iconClasses} animate-spin`} />;
  }
}
