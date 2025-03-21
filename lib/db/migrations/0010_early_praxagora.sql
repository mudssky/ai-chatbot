ALTER TABLE "KnowledgeChunk" RENAME COLUMN "chunk_hash" TO "chunkHash";--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" RENAME COLUMN "is_processed" TO "isProcessed";--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" RENAME COLUMN "processing_error" TO "processingError";--> statement-breakpoint
ALTER TABLE "KnowledgeDocument" RENAME COLUMN "storage_type" TO "storageType";--> statement-breakpoint
DROP INDEX "chunk_hash_idx";--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ALTER COLUMN "metadata" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ALTER COLUMN "embedding" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ADD COLUMN "chunkIndex" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "KnowledgeDocument" ADD COLUMN "processingStatus" varchar DEFAULT 'pending' NOT NULL;--> statement-breakpoint
CREATE INDEX "chunk_order_idx" ON "KnowledgeChunk" USING btree ("documentId","chunkIndex");--> statement-breakpoint
CREATE INDEX "chunk_hash_idx" ON "KnowledgeChunk" USING btree ("chunkHash");