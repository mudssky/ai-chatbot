ALTER TABLE "KnowledgeDocument" ALTER COLUMN "chunkSize" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "KnowledgeDocument" ALTER COLUMN "chunkSize" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "KnowledgeDocument" ALTER COLUMN "chunkOverlap" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "KnowledgeDocument" ALTER COLUMN "chunkOverlap" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "KnowledgeDocument" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "KnowledgeDocument" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ADD COLUMN "chunk_hash" text;--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ADD COLUMN "is_processed" boolean;--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ADD COLUMN "processing_error" text;--> statement-breakpoint
ALTER TABLE "KnowledgeDocument" ADD COLUMN "chunkCount" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX "chunk_hash_idx" ON "KnowledgeChunk" USING btree ("chunk_hash");