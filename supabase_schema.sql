-- SQL Schema for Pijar Academy
-- Execute this in the Supabase SQL Editor

-- Create PIJAR_users table
CREATE TABLE IF NOT EXISTS "PIJAR_users" (
  "uid" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PIJAR_courses table
CREATE TABLE IF NOT EXISTS "PIJAR_courses" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "enrollmentKey" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PIJAR_modules table
CREATE TABLE IF NOT EXISTS "PIJAR_modules" (
  "id" TEXT PRIMARY KEY,
  "courseId" TEXT NOT NULL REFERENCES "PIJAR_courses"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "mediaUrl" TEXT,
  "pdfUrl" TEXT,
  "externalLink" TEXT,
  "order" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
-- Note: Since this is a simple webapp interacting via anon key, we'll allow all operations.
-- For production, you should restrict write operations to authenticated admins only.

ALTER TABLE "PIJAR_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PIJAR_courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PIJAR_modules" ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write (Development only)
CREATE POLICY "Allow public all operations on PIJAR_users" ON "PIJAR_users" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all operations on PIJAR_courses" ON "PIJAR_courses" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all operations on PIJAR_modules" ON "PIJAR_modules" FOR ALL USING (true) WITH CHECK (true);
