export default {
  dbURL: process.env.VITE_MONGO_CONNECTION_STRING_PROD,
  dbName : process.env.DB_NAME || 'miss-bug-db'
}
