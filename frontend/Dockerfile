FROM node:20-alpine

WORKDIR /app

# Copy manifest files (package.json and optionally package-lock.json)
COPY package*.json ./

# Install deps; prefer npm ci when lockfile present
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the app
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


