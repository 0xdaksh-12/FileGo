# Stage 1: Build client static files
# Build context is the project root so we can reference both client/ and nginx/
FROM node:22-alpine AS builder

WORKDIR /app

# Accept VITE_API_URL as build-time ARG so Vite bakes it into the bundle
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY client/package*.json ./
RUN npm ci

COPY client/ .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy root-level nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy compiled static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
