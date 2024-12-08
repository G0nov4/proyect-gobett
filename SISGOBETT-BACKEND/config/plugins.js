module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      jwtSecret: env('JWT_SECRET'),
    }
  },
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 25 * 1024 * 1024, // Límite de tamaño
      },
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      },
      actionOptions: {
        upload: {
          compress: true, 
          quality: 90, 
          maxWidth: 4000, 
          maxHeight: 4000 
        },
        uploadStream: {
          maxFileSize: 25 * 1024 * 1024 // 200MB
        },
        delete: {},
        fileTypes: {
          images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
        },
        security: {
          hashFileNames: true, // Hashear nombres de archivo
          sanitizeSvg: true, // Limpiar archivos SVG
          validateFileSize: true,
          validateMimeType: true
        }
      },
    },
  },
  // ...
});