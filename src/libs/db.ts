import mysql, { Connection } from 'mysql';

// 创建MySQL连接配置
const connectionConfig: mysql.ConnectionConfig = {
  host: 'localhost', // 数据库主机名
  user: 'username', // 数据库用户名
  password: 'password', // 数据库密码
  database: 'database_name' // 数据库名称
};

// 创建MySQL连接
const connection: Connection = mysql.createConnection(connectionConfig);

// 连接到MySQL数据库
connection.connect((err: mysql.MysqlError | null) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + connection.threadId);
});

// // 执行一条SQL查询
// connection.query('SELECT * FROM table_name', (error: QueryError | null, results?: any[], fields?: FieldPacket[]) => {
//   if (error) {
//     console.error('Error executing query: ' + error.stack);
//     return;
//   }
//   console.log('Query results:', results);
// });

// // 插入数据
// const newRecord = { name: 'John', age: 30 };
// connection.query('INSERT INTO table_name SET ?', newRecord, (error: QueryError | null, results?: any, fields?: FieldPacket[]) => {
//   if (error) {
//     console.error('Error inserting record: ' + error.stack);
//     return;
//   }
//   console.log('Inserted new record with ID ' + results.insertId);
// });

// // 更新数据
// connection.query('UPDATE table_name SET age = ? WHERE name = ?', [31, 'John'], (error: QueryError | null, results?: any, fields?: FieldPacket[]) => {
//   if (error) {
//     console.error('Error updating record: ' + error.stack);
//     return;
//   }
//   console.log('Updated ' + results.affectedRows + ' records');
// });

// // 删除数据
// connection.query('DELETE FROM table_name WHERE age < ?', [30], (error: mysql.MysqlError | null, results?: any, fields?: FieldPacket[]) => {
//   if (error) {
//     console.error('Error deleting records: ' + error.stack);
//     return;
//   }
//   console.log('Deleted ' + results.affectedRows + ' records');
// });

// // 断开与MySQL数据库的连接
// connection.end((err: mysql.MysqlError | null) => {
//   if (err) {
//     console.error('Error disconnecting from MySQL database: ' + err.stack);
//     return;
//   }
//   console.log('Disconnected from MySQL database');
// });
