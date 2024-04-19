import Axios, { AxiosError } from "axios";
import  { HttpsProxyAgent }  from "https-proxy-agent/dist";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import config from '../config/config.json';
import {getRandomString, getPrivateKeys, saveToken } from './libs/utils';

//私钥
let keyPairs: string | any[];

class task {
  
    axios: any;
    address: any;
    privateKey: any;
    devices: string;
    identities: string;
    proxyAgent: any;
    //构造函数 创建对象初始化对象属性
    constructor(address: string,privateKey: string,proxy: string) {
        // 固定参数
        this.proxyAgent = new HttpsProxyAgent({
            host: '193.58.145.42',
            port: 12323,
            auth: '14af35596daca:a08c62e99e'
        });
        this.axios = Axios.create({
            httpsAgent: this.proxyAgent
        });
        this.address = address;
        this.privateKey = privateKey;
        // 项目函数可调整
        this.devices = `18e9d${getRandomString(10)}-${getRandomString(15)}-26001b51-2073600-18e9d${getRandomString(10)}`
        this.identities = Buffer.from(this.devices).toString('base64');
    }


    // 获取登录签名信息
    async wallet_message() {
        try {
            let res = await this.axios({
                method: "GET",
                headers: {
                    'Host': 'api.xter.io',
                    'Connection': 'keep-alive',
                    'content-type': 'application/json',
                    'sensorsdatajssdkcross': `%7B%22distinct_id%22%3A%22${this.devices}%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22${this.identities}%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%22%2C%22value%22%3A%22%22%7D%2C%22%24device_id%22%3A%22${this.devices}%22%7D`,
                    'Authorization': '',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Origin': 'https://xter.io',
                    'Referer': 'https://xter.io/',
                    'Accept-Language': 'zh-CN,zh;q=0.9'
                },
                url: `https://api.xter.io/account/v1/login/wallet/${this.address}`,
            });
            return res?.data?.data;
        } catch (error) {
            console.error('获取登录签名信息，失败',error)
            if (error instanceof AxiosError) {
                return error?.response?.data; // 此处 error 已被 TypeScript 识别为 AxiosError 类型
            }
            return null;
        }
    }

    // 签名信息
    async signMessage(message: string) {
        const wallet = new ethers.Wallet(this.privateKey);
        let signature = await wallet.signMessage(message);
        return signature;
    }

    // 登录
    async wallet_login(sign: string) {
        try {
            let res = await this.axios({
                method: "POST",
                headers: {
                    'Host': 'api.xter.io',
                    'Connection': 'keep-alive',
                    'content-type': 'application/json',
                    'sensorsdatajssdkcross': `%7B%22distinct_id%22%3A%22${this.devices}%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22${this.identities}%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%22%2C%22value%22%3A%22%22%7D%2C%22%24device_id%22%3A%22${this.devices}%22%7D`,
                    'Authorization': '',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Origin': 'https://xter.io',
                    'Referer': 'https://xter.io/',
                    'Accept-Language': 'zh-CN,zh;q=0.9'
                },
                url: 'https://api.xter.io/account/v1/login/wallet',
                data: `{"address":"${this.address}","type":"eth","sign":"${sign}","provider":"METAMASK","invite_code":""}`
            });
            return res?.data;
        } catch (error) {
            console.error('登录，失败',error)
            if (error instanceof AxiosError) {
                return error?.response?.data; // 此处 error 已被 TypeScript 识别为 AxiosError 类型
            }
            return null;
        }
    }

    async Run(){
        console.log(`${this.address}，获得登录签名`)
        let wallet_message = await this.wallet_message()
        if (wallet_message?.message != undefined) {
            console.log("钱包签名")
            let signMessage = await this.signMessage(wallet_message?.message);
            console.log(`签名信息:${signMessage}`)
            console.log('登录')
            let wallet_login = await this.wallet_login(signMessage)
            if (wallet_login?.err_code === 0) {
                console.log(`登录成功:${this.address}`)
                saveToken(`${this.address}----${this.privateKey}----${wallet_login?.data?.id_token}\n`)
            }else{
                console.log(`登录失败，${this.address}:${wallet_login}`)
            }
        }else{
            console.log(`${this.address}:${wallet_message}`)
            
        }  
    }

}

 function Run(){
    console.log('执行login');
    keyPairs = getPrivateKeys();
    console.log("keyPairs:", keyPairs);
    const proxy = config.proxy.address;
    for (let i = 0; i < keyPairs.length; i++) {
        const address = keyPairs[i].address;
        const privateKey = keyPairs[i].privateKey;
        console.log(`第${i}个，地址：${address}:Run...`);
        const myTask = new task(address,privateKey,proxy);
         myTask.Run();
    }
}

Run();