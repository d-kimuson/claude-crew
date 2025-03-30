ALTER TABLE "documents" RENAME COLUMN "created_at" TO "updated_at";--> statement-breakpoint
CREATE UNIQUE INDEX "documents-file-path-project-id" ON "documents" USING btree ("file_path","project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "resources-file-path-project-id" ON "resources" USING btree ("file_path","project_id");--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "created_at";