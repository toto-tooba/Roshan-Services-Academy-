import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function getNotes() {
    const { data, error } = await supabase.from('notes').select('*').limit(1);
    console.log(data, error);
}
getNotes();
