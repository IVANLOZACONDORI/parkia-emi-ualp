FROM node:22-alpine
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend ./
COPY frontend /app/frontend
ENV FRONTEND_DIR=/app/frontend
EXPOSE 4000
CMD ["npm", "start"]
