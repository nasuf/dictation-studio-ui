import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://orvcshdggqwqpndspqzm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydmNzaGRnZ3F3cXBuZHNwcXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0MDEyNTcsImV4cCI6MjA0NDk3NzI1N30.OtWRrOxagU6DUiAvgEYioAanPTdYrMZ2gfa0-PCO0LY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
