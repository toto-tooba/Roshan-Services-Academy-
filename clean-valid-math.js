import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clean() {
  await supabase.from('notes').delete().eq('id', 'mRr9kwNsvQAYgEVXxe2Qq');
  console.log('Cleaned dummy Valid Math PDF note');
}
clean();
