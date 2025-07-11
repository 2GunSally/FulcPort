import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://jlmssfyosguypwxnvwaa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbXNzZnlvc2d1eXB3eG52d2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NzQ2MzUsImV4cCI6MjA2NjI1MDYzNX0.WLCi1JpSwKridpypiZfassUvqcuQ2Iqzx8AnT3zFJZc';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };