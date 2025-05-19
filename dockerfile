# Gunakan image Node.js versi terbaru
FROM node:18

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh source code
COPY . .

# Build Next.js
RUN npm run build

# Tentukan port aplikasi berjalan
EXPOSE 3000

# Jalankan Next.js sebagai server
CMD ["npm", "start"]
