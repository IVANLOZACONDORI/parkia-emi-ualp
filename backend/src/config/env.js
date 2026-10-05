import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://parkia:parkia2026@localhost:5432/parkia_emi',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  captchaSecret: process.env.CAPTCHA_SECRET || 'captcha-dev-secret-change-me',
  captchaExpiresIn: process.env.CAPTCHA_EXPIRES_IN || '5m',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  allowBackupCommands: String(process.env.ALLOW_BACKUP_COMMANDS || 'false').toLowerCase() === 'true',
  backupDir: process.env.BACKUP_DIR || './backups',
  frontendDir: process.env.FRONTEND_DIR || new URL('../../../frontend', import.meta.url).pathname
};
