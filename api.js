async function asJSON(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.payload = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  me: () => fetch('/api/me').then(asJSON),
  setTier: (tier) =>
    fetch('/api/set-tier', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tier }),
    }).then(asJSON),
  generate: (payload) =>
    fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(asJSON),
};
