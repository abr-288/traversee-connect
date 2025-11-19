-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('flight_confirmation', 'support', 'newsletter', 'invoice', 'support_confirmation')),
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage email templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.email_templates (name, type, subject, html_content, variables) VALUES
(
  'Confirmation de vol',
  'flight_confirmation',
  '✈️ Confirmation de vol {{from}} → {{to}}',
  '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 10px 10px 0 0; text-align: center; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>✈️ Confirmation de réservation</h1>
    </div>
    <div class="content">
      <p>Bonjour {{customerName}},</p>
      <p>Votre vol de {{from}} à {{to}} est confirmé !</p>
      <p>Date de départ : {{departureDate}}</p>
      <p>Référence : {{bookingId}}</p>
    </div>
  </body>
</html>',
  '["customerName", "from", "to", "departureDate", "bookingId"]'
),
(
  'Message support',
  'support',
  '[Support] {{subject}}',
  '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>📧 Nouveau message</h1>
    </div>
    <div class="content">
      <p><strong>De :</strong> {{name}} ({{email}})</p>
      <p><strong>Sujet :</strong> {{subject}}</p>
      <p><strong>Message :</strong></p>
      <p>{{message}}</p>
    </div>
  </body>
</html>',
  '["name", "email", "subject", "message"]'
),
(
  'Bienvenue newsletter',
  'newsletter',
  'Bienvenue chez B-Reserve ! 🎉',
  '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #333; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 10px 10px 0 0; text-align: center; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>🎉 Bienvenue !</h1>
    </div>
    <div class="content">
      <p>Merci de vous être inscrit à notre newsletter !</p>
      <p>Vous recevrez les meilleures offres de voyage.</p>
    </div>
  </body>
</html>',
  '[]'
);