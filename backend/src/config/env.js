const dotenv = require('dotenv')

dotenv.config()

function inteiro(value, fallback, nome) {
  const parsed = Number.parseInt(value ?? String(fallback), 10)
  if (Number.isNaN(parsed)) throw new Error(`${nome} deve ser um número inteiro.`)
  return parsed
}

module.exports = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: inteiro(process.env.PORT, 3000, 'PORT'),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: inteiro(process.env.DB_PORT, 3306, 'DB_PORT'),
  dbName: process.env.DB_NAME || 'usiestoque_dda',
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  seedAdminName: process.env.SEED_ADMIN_NAME || 'Administrador Local',
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@usiestoque.local',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || '',
})
