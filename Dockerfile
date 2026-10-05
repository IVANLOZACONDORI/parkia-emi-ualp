FROM node:22-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend ./
COPY frontend /app/frontend
ENV FRONTEND_DIR=/app/frontend
EXPOSE 4000
CMD ["npm", "start"]
