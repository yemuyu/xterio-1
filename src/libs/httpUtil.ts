import { ProxyInfo } from './type';
import { getHttpProxy } from './utils';
import axios, { AxiosInstance, AxiosError } from "axios";
import https from 'https';
import  { HttpsProxyAgent }  from "https-proxy-agent/dist";

export class httpUtil {
    static proxies:ProxyInfo [];

    
    static{
        console.log('初始化代理')
        this.proxies = getHttpProxy();
    }

    static getProxy() {
        //从proxies数组中随机一个
        const proxy = httpUtil.getRandomProxy(this.proxies);
        const proxyAgent = new HttpsProxyAgent({
            host: proxy.ip,
            port: proxy.port,
            auth: `${proxy.name}:${proxy.pass}`
        });

        // 创建一个 Axios 实例
        const instance:AxiosInstance = axios.create({
            httpsAgent: proxyAgent
        });

        return instance;
    }

    // 从 proxies 数组中随机选择一个元素
    static getRandomProxy(proxies: ProxyInfo[]): ProxyInfo | undefined {
        if (proxies.length === 0) {
        return undefined; // 如果数组为空，则返回 undefined
        }
        // const randomIndex = Math.floor(Math.random() * proxies.length); // 生成随机索引
        const randomIndex = 0;
        return proxies[randomIndex]; // 返回随机选择的元素
    }

}


function Run() {
    const instance:AxiosInstance = httpUtil.getProxy();
    try {
        const response = instance.get('https://www.baidu.com');
        console.log('Response from Baidu:', response);
        console.log('调用结束')
    } catch (error) {
        console.error('Error fetching from Baidu:', error);
        throw error;
    }
}


Run();