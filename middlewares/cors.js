import cors from 'cors'

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:1234',
  'http://127.0.0.1:5500',
  'http://127.0.0.1',
  'http://backend-dev-tfdp.4.us-1.fl0.io'
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {
    return callback(null, true)
  }
})
