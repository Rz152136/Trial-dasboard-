// api/login.js
const { getServiceClient } = require('../lib/supabaseClient');

module.exports = async (req, res) => {
  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  }

  const supabase = getServiceClient();

  // 🔐 Login ke Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: 'Email atau password salah.' });
  }

  // Ambil profile user dari tabel 'profiles'
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(500).json({ error: 'Profil user tidak ditemukan.' });
  }

  // ✅ KIRIM RESPONSE SUKSES
  return res.status(200).json({
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: profile.full_name,
      role: profile.role,
    },
    session: data.session,
  });
};
