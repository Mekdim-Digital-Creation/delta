export function notFound(req, res) {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Translate driver-level failures into actionable messages.
  if (err?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ ok: false, error: 'That record already exists' });
  }
  if (err?.code === 'ECONNREFUSED' || err?.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({ ok: false, error: 'Database unreachable — is MySQL running?' });
  }

  const status = err.status || 500;
  const message = err.status ? err.message : 'Internal server error';
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ ok: false, error: message });
}
