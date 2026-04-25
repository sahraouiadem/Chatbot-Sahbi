# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite consumes VITE_* at build time.
ARG VITE_GEMINI_API_KEY=AIzaSyDX7PUoXqC-ftaDEnYfNMnXPCulClt_Iwk
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}

RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
