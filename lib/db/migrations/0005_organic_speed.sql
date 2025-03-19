CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE "KnowledgeBase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdAt" timestamp NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "KnowledgeChunk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"documentId" uuid NOT NULL,
	"content" text NOT NULL,
	"metadata" json NOT NULL,
	"embedding" vector(1024) NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "KnowledgeDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"knowledgeBaseId" uuid NOT NULL,
	"fileName" text NOT NULL,
	"filePath" text NOT NULL,
	"fileType" varchar(32) NOT NULL,
	"fileSize" varchar(32) NOT NULL,
	"chunkSize" integer DEFAULT 1000 NOT NULL,
	"chunkOverlap" integer DEFAULT 200 NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_documentId_KnowledgeDocument_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."KnowledgeDocument"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_knowledgeBaseId_KnowledgeBase_id_fk" FOREIGN KEY ("knowledgeBaseId") REFERENCES "public"."KnowledgeBase"("id") ON DELETE no action ON UPDATE no action;