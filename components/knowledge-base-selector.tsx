'use client';

import { useEffect } from 'react';
import { Popover, Select } from 'antd';
import { Library } from 'lucide-react';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import { cn } from '@/lib/utils';
export interface KnowledgeBaseSelectorProps {
  className?: string;
}
export function KnowledgeBaseSelector({
  className,
}: KnowledgeBaseSelectorProps) {
  const knowledgeBases = useKnowledgeBaseStore((state) => state.knowledgeBases);
  const setKnowledgeBases = useKnowledgeBaseStore(
    (state) => state.setKnowledgeBases,
  );
  const selectedKnowledgeBases = useKnowledgeBaseStore(
    (state) => state.selectedKnowledgeBases,
  );
  const setSelectedKnowledgeBases = useKnowledgeBaseStore(
    (state) => state.setSelectedKnowledgeBases,
  );

  // Fetch knowledge bases
  useEffect(() => {
    const fetchKnowledgeBases = async () => {
      try {
        const response = await fetch('/api/knowledge-base');
        if (!response.ok) throw new Error('获取失败');
        const data = await response.json();
        setKnowledgeBases(data.data || []);
      } catch (error) {
        console.error('获取知识库列表失败', error);
      }
    };

    fetchKnowledgeBases();
  }, [setKnowledgeBases]);

  return (
    <div className={cn(className)}>
      <Popover
        content={
          <Select
            mode="multiple"
            style={{ minWidth: '180px' }}
            placeholder="选择知识库"
            value={selectedKnowledgeBases}
            onChange={(value) => setSelectedKnowledgeBases(value)}
            options={knowledgeBases.map((kb) => ({
              label: kb.name,
              value: kb.id,
            }))}
          />
        }
      >
        <Library
          size={20}
          className={cn(
            'cursor-pointer',
            selectedKnowledgeBases.length > 0 ? 'text-blue-500' : '',
          )}
        />
      </Popover>
    </div>
  );
}
