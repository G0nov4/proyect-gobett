FROM node:18.19.0

# Create app directory
WORKDIR /opt/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Set environment variables
ENV NODE_ENV=development

# Crear y dar permisos al directorio de uploads
RUN mkdir -p /app/public/uploads && \
    chown -R node:node /app/public/uploads

EXPOSE 1337

CMD ["npm", "run", "develop"]