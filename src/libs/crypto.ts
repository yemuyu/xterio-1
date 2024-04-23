import * as crypto from 'crypto';
import {getSecretKey} from './utils';
import { run } from 'node:test';

class CryptoUtil {
    secretKey:string;
    constructor() {
        this.secretKey = getSecretKey();
    }

    // 加密函数
     encrypt(text: string): string {
        const iv = crypto.randomBytes(16); // 生成随机的初始化向量
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.secretKey, 'hex'), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + encrypted;
    }

    // 解密函数
     decrypt(encryptedText: string): string {
        const iv = Buffer.from(encryptedText.slice(0, 32), 'hex'); // 提取初始化向量
        const encryptedTextWithoutIV = encryptedText.slice(32); // 去除初始化向量部分
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.secretKey, 'hex'), iv);
        let decrypted = decipher.update(encryptedTextWithoutIV, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    
}

function test() {
    const cryptoUtil:CryptoUtil = new CryptoUtil();
    // 要加密的明文和密钥
    const plaintext = 'Hello, world!';

    // 加密
    const encryptedText = cryptoUtil.encrypt(plaintext);
    console.log('Encrypted:', encryptedText);

    // 解密
    const decryptedText = cryptoUtil.decrypt(encryptedText);
    console.log('Decrypted:', decryptedText);
}


test();

