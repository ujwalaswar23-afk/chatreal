# Frontend build Dockerfile (optional when serving via backend)
FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package.json ./frontend/package.json
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

# Serve from nginx (optional)
FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
