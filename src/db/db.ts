import {drizzle} from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import {getDbConfig} from '../libs/utils'

const dbConfig = getDbConfig();
const pool = mysql.createPool({
    host: dbConfig.host,
    port: 3306,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
})

export function closePool() {
    pool.end();
}

export const db = drizzle(pool)


