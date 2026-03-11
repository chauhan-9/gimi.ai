-- Create storage bucket for published sites
INSERT INTO storage.buckets (id, name, public) VALUES ('published-sites', 'published-sites', true);

-- Create published_sites table to track published projects
CREATE TABLE public.published_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  custom_url TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.published_sites ENABLE ROW LEVEL SECURITY;

-- Users can manage their own published sites
CREATE POLICY "Users can view own published sites"
  ON public.published_sites FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own published sites"
  ON public.published_sites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own published sites"
  ON public.published_sites FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own published sites"
  ON public.published_sites FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Storage policies for published sites bucket
CREATE POLICY "Anyone can view published sites"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'published-sites');

CREATE POLICY "Authenticated users can upload to published-sites"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'published-sites');

CREATE POLICY "Users can update own published files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'published-sites');

CREATE POLICY "Users can delete own published files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'published-sites');