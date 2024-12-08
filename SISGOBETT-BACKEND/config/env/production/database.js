module.exports = ({ env }) => ({
    connection: {
      client: 'mysql',
      connection: {
        host: env('DATABASE_HOST'),
        port: env.int('DATABASE_PORT'),
        database: env('DATABASE_NAME'),
        user: env('DATABASE_USERNAME'),
        password: env('DATABASE_PASSWORD'),
        ssl: {
          rejectUnauthorized:env.bool('DATABASE_SSL_SELF', false),
        },
      },
      debug: false,
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 5) },                                  
    },
  }); 

    