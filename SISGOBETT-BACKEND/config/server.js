module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  security: {
    ssl: env.bool('SSL', false),
    httpOnly: true,
    secure: env.bool('SECURE_COOKIES', true),
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'strict'
  }
});
