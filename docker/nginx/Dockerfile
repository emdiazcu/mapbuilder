# Stage 1: build the React frontend
FROM node:22-alpine AS frontend
RUN corepack enable
WORKDIR /app
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ .
# Override .env.production so the built app uses relative /api paths
ENV VITE_API_URL=/api
RUN pnpm build

# Stage 2: nginx serves the SPA and proxies /api → PHP-FPM
FROM nginx:1.27-alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
