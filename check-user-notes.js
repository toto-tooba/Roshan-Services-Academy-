import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkNotes() {
  const { data, error } = await supabase.from('notes').select('*');
  console.log(data);
}
checkNotes();
