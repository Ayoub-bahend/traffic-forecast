FROM node:20-alpine

WORKDIR /app

# Copy manifest files (package.json and optionally package-lock.json)
COPY package*.json ./

# Install deps (use npm install to avoid strict lockfile mismatch failures in CI/build)
RUN npm install --no-audit --no-fund

# Copy the rest of the app
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


