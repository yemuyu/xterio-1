import { eq } from "drizzle-orm";
import { db, closePool } from "../db";
import { AccountTable } from "../schema/schema";
import { Account } from "../types/type";
import {CryptoUtil} from "../../libs/crypto"
import {getPrivateKeys} from '../../libs/utils'

async function insertAccount(account: Account) {
    account.private_key = CryptoUtil.encrypt(account.private_key);
    await db.insert(AccountTable).values(account).execute();
}

async function selectAccount(type: number):Promise<Account[]> {
    const result: Account[] = await db.select().from(AccountTable).where(eq(AccountTable.type, type)).execute();
    //解密私钥
    for (let i = 0; i < result.length; i++) {
        result[i].private_key = CryptoUtil.decrypt(result[i].private_key);
    }
    return result;
}
  
export { insertAccount, selectAccount };

async function saveAddress() {
    //读取account.txt文件
    let keyPairs: string | any[] = getPrivateKeys();
    for (let i = 0; i < keyPairs.length; i++) {
        const address = keyPairs[i].address;
        const privateKey = keyPairs[i].privateKey;
        console.log(`第${i}个，地址：${address}:Run...`);
        //加密私钥
        //写入数据库
        insertAccount(new Account(null, address, 2, privateKey, new Date()));
    }
    //加密秘钥
    //写入数据库
}

async function test() {
    // const account = new Account(null, '0x123', 1, '123', new Date());
    // await insertAccount(account);
    // const result:Account[] = await selectAccount(1);
    // console.log(result);
    // saveAddress();
    const accountList: Account[] = await selectAccount(3);
    //循环打印账号信息
    for (let i = 0; i < accountList.length; i++) {
        console.log(`第${i}个，地址：${accountList[i].address},私钥：${accountList[i].private_key}`);
    }
    closePool();
}

test();