const supabase = require('./supabase');

async function getCache(key) {
  const { data, error } = await supabase
    .from('cache')
    .select('value')
    .eq('key', key)
    .lte('expires_at', new Date().toISOString())
    .maybeSingle();

  return data?.value || null;
}

async function setCache(key, value, ttlSeconds) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  await supabase
    .from('cache')
    .upsert([{ key, value, expires_at: expiresAt }], { onConflict: ['key'] });
}

module.exports = { getCache, setCache };
