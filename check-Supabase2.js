import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function getNotes() {
    const { data, error } = await supabase.from('notes').select('id, title, category, sub_category, created_at').limit(1);
    console.log("DATA:", data);
    console.log("ERROR:", error);
}
getNotes();
