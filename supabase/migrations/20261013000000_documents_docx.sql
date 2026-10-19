-- Migration: Add docx_base64 to documents table and configure RLS
-- Safe idempotency: preserves existing records, columns, and tables

CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content_markdown TEXT,
  content_html TEXT,
  docx_base64 TEXT,
  storage_path TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add docx_base64 column if table already existed without it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'documents' 
    AND column_name = 'docx_base64'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN docx_base64 TEXT;
  END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own documents, or any document flagged public
CREATE POLICY "Users can view own or public documents"
ON public.documents
FOR SELECT
USING (
  auth.uid() = user_id OR is_public = true
);

-- Policy: Users can insert their own documents
CREATE POLICY "Users can insert own documents"
ON public.documents
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update own documents"
ON public.documents
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON public.documents
FOR DELETE
USING (
  auth.uid() = user_id
);

-- Indexes for performant lookup by user_id and updated_at
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents(updated_at DESC);
