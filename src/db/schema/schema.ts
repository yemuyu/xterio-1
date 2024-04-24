

import { relations } from 'drizzle-orm'
import { boolean, index, int, mysqlEnum, mysqlTable, primaryKey, real, timestamp, unique, varchar,text } from 'drizzle-orm/mysql-core'

export const AccountTable = mysqlTable('account', {
  id: int("id").primaryKey(),
  type: int("type"),
  address: varchar('address', { length: 256 }),
  private_key: text('private_key'),
  create_time: timestamp('create_time'),
});
