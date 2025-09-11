# Build
npm run build

# Producción  
npm start

# Docker
docker build -f Dockerfile.prod -t cotizadorweb .
docker run -p 3000:3000 cotizadorweb




docker-compose up -d --build