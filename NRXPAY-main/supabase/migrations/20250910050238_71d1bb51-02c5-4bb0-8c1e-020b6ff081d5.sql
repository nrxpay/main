-- Create storage buckets for document uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('documents', 'documents', false),
('savings-docs', 'savings-docs', false),
('current-docs', 'current-docs', false),
('corporate-docs', 'corporate-docs', false);

-- Create storage policies for documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id IN ('documents', 'savings-docs', 'current-docs', 'corporate-docs') 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id IN ('documents', 'savings-docs', 'current-docs', 'corporate-docs') 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id IN ('documents', 'savings-docs', 'current-docs', 'corporate-docs') 
  AND is_admin(auth.uid())
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id IN ('documents', 'savings-docs', 'current-docs', 'corporate-docs') 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id IN ('documents', 'savings-docs', 'current-docs', 'corporate-docs') 
  AND auth.uid()::text = (storage.foldername(name))[1]
);