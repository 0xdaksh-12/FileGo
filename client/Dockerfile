# Stage 1: Build
# VITE_API_URL must be passed as a build ARG so Vite can bake it into the
# static bundle. Runtime env vars have no effect on pre-built static files.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Accept the URL as a build-time argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# SEC-4: Add a strict CSP header to the default Nginx config
RUN sed -i 's/location \/ {/location \/ {\n        add_header Content-Security-Policy "default-src '"'self'"'; script-src '"'self'"'; style-src '"'self'"' '"'unsafe-inline'"'; img-src '"'self'"' data: https:; connect-src '"'self'"' http:\/\/localhost:3000 https:\/\/*.amazonaws.com;" always;/' /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
