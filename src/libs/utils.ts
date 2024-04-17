import fs from "fs";

// 获取10位时间戳
export function getRandom() {
    return Math.floor(Date.now() / 1000);
}
// 获取随机min-max数字
export function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
// 延迟
export function sleep(ms: number | undefined) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//获取随机字符串
export function getRandomString(length: number) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

//获取私钥
export function getPrivateKeys() {
    const keyPairs = [] as { address: string; privateKey: string; }[];
    const relativeFilePath = 'data/account.txt';
    const data = readFile(relativeFilePath);

    const data_array = data.split("\n").filter((line: string) => line.trim() !== '');
        
    data_array.forEach((line: string) => {
        const [address, privateKey] = line.trim().split('----');
        keyPairs.push({ address, privateKey });
    });
    console.log("getPrivateKeys,keyPairs:", keyPairs);
    return keyPairs;
}

//获取token
export function getToken() {
    const keyPairs = [] as { address: string; privateKey: string; token:string }[];
    const relativeFilePath = 'data/token.txt';
    const data = readFile(relativeFilePath);

    const data_array = data.split("\n").filter((line: string) => line.trim() !== '');
        
    data_array.forEach((line: string) => {
        const [address, privateKey, token] = line.trim().split('----');
        keyPairs.push({ address, privateKey, token });
    });
    console.log("getPrivateKeys,keyPairs:", keyPairs);
    return keyPairs;
}

export function saveToken(data: string) {
    writeFile('data/token.txt', data);
}

//读文件
export function readFile(relativeFilePath:string) {
    let data = '';
    const keyPairs = [] as { address: string; privateKey: string; }[];
    const fs = require('fs');
    const path = require('path');
    const projectDir = process.cwd();
    const absoluteFilePath = path.resolve(projectDir, relativeFilePath);

    try {
        data = fs.readFileSync(absoluteFilePath, 'utf8');
        console.log('文件内容:', data);
    } catch (err) {
        console.error('无法读取文件:', err);
    }
    return data;
}

 export function writeFile(relativeFilePath: string, data: string) {
    const fs = require('fs');
    const path = require('path');
    const projectDir = process.cwd();
    const absoluteFilePath = path.resolve(projectDir, relativeFilePath);
    fs.appendFileSync(absoluteFilePath, data);
}


export function getDeviceId() {
    return `18e9d${getRandomString(10)}-${getRandomString(15)}-26001b51-2073600-18e9d${getRandomString(10)}`;
}

/**
 * chat答案
 * @param name 
 * @returns 
 */
export function getChatAnswer(name:string) {
    let chatTextIndex = 0;
    const relativeFilePath = `data/xter-${name}-text.txt`;

    let data = readFile(relativeFilePath);
    let chatTextList = data.toString().split('\n').map((line) => {
        return line.trim()
    }).filter(line => {
        return line !== ''
    })
    const answer = chatTextList[chatTextIndex];
    return answer;
}

export function getInviteCode() {
    const relativeFilePath = 'data/inviteCode.txt';
    const data = readFile(relativeFilePath);
    return data;
}