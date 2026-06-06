async function run() {
  const res = await fetch("https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/upload/sign/notes/test-cors.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYTI3NjAxNC1mNzk1LTQ4MjAtYTdmMy0wZTE2MDkxMTgyYTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJub3Rlcy90ZXN0LWNvcnMucGRmIiwidXBzZXJ0IjpmYWxzZSwiaWF0IjoxNzc2NTExNDQyLCJleHAiOjE3NzY1MTg2NDJ9.UV11ciF-11239_XPuA-8ZZs-dNSlCJBJzmjpQ9ASrNQ", {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://ais-dev-5vyiv6mxuebtg54fhyamir-361780527475.asia-east1.run.app',
      'Access-Control-Request-Method': 'PUT'
    }
  });
  console.log(res.status, res.statusText);
  res.headers.forEach((v, k) => console.log(k, v));
}
run();
