import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hgjqkzvbnmtogbalmytb.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnanFrenZibm10b2diYWxteXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDc4NTMsImV4cCI6MjA3OTI4Mzg1M30.Rvrnc7rH1te_nbJ0pZj1_mANbaXW-5xJLZAjRw6skho";

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);