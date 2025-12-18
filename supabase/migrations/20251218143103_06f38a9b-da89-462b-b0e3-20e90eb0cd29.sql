-- Add 'sub_agency' role to the enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sub_agency';