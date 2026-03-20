-- Create table for dashboard preferences
CREATE TABLE IF NOT EXISTS public.dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layout_name TEXT NOT NULL DEFAULT 'default',
  widgets_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, layout_name)
);

-- Enable RLS
ALTER TABLE public.dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for dashboard preferences
CREATE POLICY "Admins can manage their own dashboard preferences"
ON public.dashboard_preferences
FOR ALL
USING (
  auth.uid() = user_id AND 
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.uid() = user_id AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_dashboard_preferences_updated_at
BEFORE UPDATE ON public.dashboard_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_dashboard_preferences_user_id ON public.dashboard_preferences(user_id);
CREATE INDEX idx_dashboard_preferences_active ON public.dashboard_preferences(user_id, is_active) WHERE is_active = true;