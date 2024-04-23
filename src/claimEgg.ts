import Axios, { AxiosError } from "axios";
import  { HttpsProxyAgent }  from "https-proxy-agent/dist";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import config from '../config/config.json';
import {getRandomString, getToken } from './libs/utils';
import { getIncubatorABI } from './libs/abi';
import { getDeviceId } from './libs/utils';

//私钥
let keyPairs: string | any[];

class task {
    address: string;
    privateKey: string;
    id_token: string;
    devices: string;
    identities: string;
    proxyAgent: any;
    provider: ethers.providers.JsonRpcProvider;
    wallet: ethers.Wallet;
    //构造函数 创建对象初始化对象属性
    constructor(address:string, privateKey:string, id_token:string) {
        this.address = address;
        this.privateKey = privateKey;
        this.id_token = id_token;
        // 项目函数可调整
        this.devices = getDeviceId();
        this.identities = Buffer.from(this.devices).toString('base64');
        this.provider = new ethers.providers.JsonRpcProvider('https://xterio.alt.technology/');
        this.wallet = new ethers.Wallet(`${this.privateKey}`, this.provider);
    }

    async claimEgg() {
        //provider
        const providerUrl = 'http://xterio.rpc.huashui.ren/';
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        //wallet
        const wallet = new ethers.Wallet(this.privateKey, provider);
        //contract
        const contractAddress = '0xBeEDBF1d1908174b4Fc4157aCb128dA4FFa80942'
        const ABI = getIncubatorABI();
        const contract = new ethers.Contract(contractAddress, ABI, wallet);
    
        try {
            // 调用 claimEgg 函数
            const tx = await contract.claimEgg();
            console.log("Transaction hash:", tx.hash);
            
            // 等待交易被挖掘
            await tx.wait();
            console.log("Transaction confirmed.");
            console.log("完成开蛋");
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async Run() {
        console.log('claim egg')
        await this.claimEgg();
    }
  
}

function Run() {
    console.log('执行claimEgg任务...');
    keyPairs = getToken();
    for (let i = 0; i < keyPairs.length; i++) {
        const address = keyPairs[i].address;
        const privateKey = keyPairs[i].privateKey;
        const id_token = keyPairs[i].token;
        console.log(`第${i}个，地址：${address}:Run...`);
        const myTask = new task(address, privateKey, id_token);
         myTask.Run();
    }
}


Run();