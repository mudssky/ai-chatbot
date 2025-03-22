'use client';

import { create } from 'zustand';
import type { KnowledgeBase } from '@/lib/db/schema';

interface KnowledgeBaseState {
  // 所有可用的知识库列表
  knowledgeBases: KnowledgeBase[];
  // 当前选中的知识库ID列表
  selectedKnowledgeBases: string[];
  // 设置所有可用的知识库
  setKnowledgeBases: (knowledgeBases: KnowledgeBase[]) => void;
  // 设置选中的知识库
  setSelectedKnowledgeBases: (selectedKnowledgeBases: string[]) => void;
  // 添加单个知识库到选中列表
  addSelectedKnowledgeBase: (knowledgeBaseId: string) => void;
  // 从选中列表中移除单个知识库
  removeSelectedKnowledgeBase: (knowledgeBaseId: string) => void;
  // 清空选中的知识库
  clearSelectedKnowledgeBases: () => void;
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set) => ({
  knowledgeBases: [],
  selectedKnowledgeBases: [],

  setKnowledgeBases: (knowledgeBases) => set({ knowledgeBases }),

  setSelectedKnowledgeBases: (selectedKnowledgeBases) =>
    set({ selectedKnowledgeBases }),

  addSelectedKnowledgeBase: (knowledgeBaseId) =>
    set((state) => ({
      selectedKnowledgeBases: state.selectedKnowledgeBases.includes(
        knowledgeBaseId,
      )
        ? state.selectedKnowledgeBases
        : [...state.selectedKnowledgeBases, knowledgeBaseId],
    })),

  removeSelectedKnowledgeBase: (knowledgeBaseId) =>
    set((state) => ({
      selectedKnowledgeBases: state.selectedKnowledgeBases.filter(
        (id) => id !== knowledgeBaseId,
      ),
    })),

  clearSelectedKnowledgeBases: () => set({ selectedKnowledgeBases: [] }),
}));
