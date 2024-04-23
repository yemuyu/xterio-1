// 定义代理信息对象类型
export interface ProxyInfo {
    name: string;
    pass: string;
    ip: string;
    port: number;
  }

  export interface DbConfig {
    host: string, // 数据库地址
    user: string, // 数据库用户名
    password: string, // 数据库密码
    database: string // 数据库名称
  }