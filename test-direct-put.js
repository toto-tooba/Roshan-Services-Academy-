import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSignedUpload() {
  const { data, error } = await supabase.storage.from('notes').createSignedUploadUrl('test-direct.pdf');
  console.log('Signed URL setup:', data, error);
  
  if (data && data.signedUrl) {
    const fileContent = Buffer.from('%PDF-1.4\n%EOF\n');
    console.log('Pushing to signed URL...');
    const res = await fetch(data.signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: fileContent
    });
    
    console.log('Response Status:', res.status, res.statusText);
    const resultText = await res.text();
    console.log('Response Text:', resultText);
  }
}
testSignedUpload();
