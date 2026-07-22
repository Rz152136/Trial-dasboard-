const {
  getSupabase,
  genId,
  sanitizeEntry,
  validateEntry,
  entryToRow,
  rowToEntry,
} = require('../lib/entries');

module.exports = async (req, res) => {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data.map(rowToEntry));
  }

  if (req.method === 'POST') {
    const entry = sanitizeEntry(req.body || {});
    const errors = validateEntry(entry);
    if (errors.length) {
      return res.status(400).json({ error: errors.join(' ') });
    }

    // Upsert: cari by id dulu, kalau tidak ada cari by line+date (sama seperti
    // aturan versi Express sebelumnya — line+tanggal yang sama akan menimpa).
    let existingId = null;

    if (entry.id) {
      const { data } = await supabase
        .from('entries')
        .select('id')
        .eq('id', entry.id)
        .maybeSingle();
      if (data) existingId = data.id;
    }

    if (!existingId) {
      const { data } = await supabase
        .from('entries')
        .select('id')
        .eq('line', entry.line)
        .eq('date', entry.date)
        .maybeSingle();
      if (data) existingId = data.id;
    }

    entry.id = existingId || entry.id || genId();
    entry.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('entries')
      .upsert(entryToRow(entry), { onConflict: 'id' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(rowToEntry(data));
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
};
            
