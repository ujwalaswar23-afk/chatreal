# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --only=production

COPY backend ./backend

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
