"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusIcon } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { DatabaseIcon } from "lucide-react";
import dayjs from "dayjs";

type KnowledgeBase = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
};

// 定义表单验证模式
const formSchema = z.object({
  name: z.string().min(2, "名称至少需要2个字符").max(50, "名称最多50个字符"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function KnowledgeBaseConfig() {
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<
    string | null
  >(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: "1",
      name: "示例知识库",
      description: "这是一个示例知识库",
      createdAt: new Date(),
    },
  ]);
  
  // 初始化表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  const isSubmitting = form.formState.isSubmitting;

  // 新增获取知识库列表的方法
  const fetchKnowledgeBases = async () => {
    try {
      const response = await fetch("/api/knowledge-base");
      if (!response.ok) throw new Error("获取失败");
      const data = await response.json();
      setKnowledgeBases(data);
    } catch (error) {
      toast.error("获取知识库列表失败");
    }
  };

  // 初始化加载数据
  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  // 表单提交处理
  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("添加失败");

      const newEntry = await response.json();
      setKnowledgeBases((prev) => [...prev, newEntry]);
      form.reset();
      setSelectedKnowledgeBase(newEntry.id);
      toast.success("知识库添加成功");
    } catch (error) {
      console.error("添加知识库失败:", error);
      toast.error("添加知识库失败");
    }
  };

  const handleSelectKnowledgeBase = (id: string) => {
    setSelectedKnowledgeBase(id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 处理文件上传逻辑
    console.log("Files uploaded:", e.target.files);
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
              {knowledgeBases?.length > 0 ? (
                knowledgeBases.map((kb) => (
                  <div
                    key={kb.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${selectedKnowledgeBase === kb.id ? "bg-muted" : ""}`}
                    onClick={() => handleSelectKnowledgeBase(kb.id)}
                  >
                    <div className="font-medium">{kb.name}</div>
                    {kb.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {kb.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      创建时间: {dayjs (kb.createdAt).format()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <DatabaseIcon className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium">暂无知识库</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    请使用下方表单创建您的第一个知识库
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>新增知识库</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>知识库名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入知识库名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>知识库描述</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入知识库描述（可选）" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span className="mr-2">
                    <PlusIcon />
                  </span>
                  {isSubmitting ? "添加中..." : "添加知识库"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      {/* 右侧：文件上传区域 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedKnowledgeBase
                ? `${knowledgeBases?.find((kb) => kb.id === selectedKnowledgeBase)?.name} - 文件管理`
                : "请先选择知识库"}
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
