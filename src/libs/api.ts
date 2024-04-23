import { ethers } from "ethers";
import { Buffer } from "buffer";
const qs = require('qs');
import { getDeviceId,getRandomString } from './utils';
import { LogUtil } from './logUtil';
import { httpUtil } from './httpUtil';
import axios, { AxiosInstance, AxiosError } from "axios";


export class XterApi {
    address: string;
    deviceid: string;
    axiosInstance: AxiosInstance;
    access_token: null;
    id_token: string;
    refresh_token: null;
    is_new: any;
    config: any;
    devices: string;
    identities: string;
    constructor(address:string, id_token:string) {
        this.address = address;
        this.deviceid = getDeviceId();
        this.axiosInstance = httpUtil.getProxy();
        this.access_token = null;
        this.id_token = id_token;
        this.refresh_token = null;
        this.is_new = null; // 0 = true, 1 = false;
        this.config = null;
        // 项目函数可调整
        this.devices = `18e9d${getRandomString(10)}-${getRandomString(15)}-26001b51-2073600-18e9d${getRandomString(10)}`
        this.identities = Buffer.from(this.devices).toString('base64');
    }

    async post(url: string, body: any) {
        LogUtil.info(`${this.address} POST: ${url} - ${JSON.stringify(body)}`);
        try {
            const resp = await this.axiosInstance.post(url, body, {
                headers: {
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "authorization": this.id_token,
                    "content-type": "application/json",
                    "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    // "sensorsdatajssdkcross": this.getSensorsdata(),
                    "Referer": "https://xter.io/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                }
            });
            const respData = resp.data;
            LogUtil.info(`${this.address} POST Return: ${JSON.stringify(respData)}`);
            if (respData.err_code !== 0) {
                throw new Error(`${this.address} Request:POST ${url}-${JSON.stringify(body)} Error: ${JSON.stringify(respData)}`);
            }
            return respData.data;
        } catch (error) {
            throw new Error(`${this.address} Request:POST ${url}-${JSON.stringify(body)} Error: ${error.message}`);
        }
    }

    async get(url: string, params = {}) {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const fullUrl = queryParams ? `${url}?${queryParams}` : url;
            LogUtil.info(`${this.address} GET: ${fullUrl} - ${JSON.stringify(params)}`);
            const resp = await this.axiosInstance.get(fullUrl, {
                headers: {
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "authorization": this.id_token,
                    "content-type": "application/json",
                    "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    // "sensorsdatajssdkcross": this.getSensorsdata(),
                    "Referer": "https://xter.io/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                }
            });
            const respData = resp.data;
            LogUtil.info(`${this.address} GET Return: ${JSON.stringify(respData)}`);
            if (respData.err_code !== 0) {
                throw new Error(`${this.address} Request:GET ${fullUrl} Error: ${JSON.stringify(respData)}`);
            }
            return respData.data;
        } catch (error) {
            throw new Error(`${this.address} Request:GET ${url}-${JSON.stringify(params)} Error: ${error.message}`);
        }
    }

    getSensorsdata() {
        let identitiesStr = {"$identity_cookie_id":this.deviceid};
        const buffer = Buffer.from(JSON.stringify(identitiesStr), 'utf-8');
        const base64String = buffer.toString('base64');
        let data = {
            "distinct_id": this.deviceid,
            "first_id": "",
            "props": {
                "$latest_traffic_source_type": "引荐流量",
                "$latest_search_keyword": "未取到值",
                "$latest_referrer": "https://t.co/"
            },
            "identities": base64String,
            "history_login_id": {
                "name": "",
                "value": ""
            },
            "$device_id": this.deviceid,
        }
        return JSON.stringify(data);
        // return data;
    }


    async getConfig() {
        const url = 'https://api.xter.io/palio/v1/config';
        return this.get(url, {});
    }


    async inviteCode() {
        const url = `https://api.xter.io/palio/v1/user/${this.address}/invite/code`;
        return this.get(url);
    }
    async games() {
        const url = 'https://api.xter.io/proj/v1/games';
        return this.get(url);
    }
    async apply(code:string) {
        const url = `https://api.xter.io/palio/v1/user/${this.address}/invite/apply`;
        const body = {code}
        return await this.post(url, body);
    }

    async chat() {
        const url = `https://api.xter.io/palio/v1/user/${this.address}/chat`;
        /**
         *         "max_score": 97,
         *         "retry": 2,  // 已经重试的次数
         *         "boost": 9
         */
        return this.get(url);
    }

    async talk(answer:string) {
        if (this.config === null) {
            this.config = await this.getConfig();
        }
        const url = `${this.config!.chat_api as string}?address=${this.address}`;
        const body = {"answer":answer};
        const resp = await fetch(url, {
            "headers": {
                "accept": "*/*",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "authorization": this.id_token,
                "content-type": "text/plain;charset=UTF-8",
                "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site"
            },
            "referrer": "https://xter.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": JSON.stringify(body),
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        return await resp.text();
    }

    /**
     * 孵化，喂食
     * @returns 
     */
    async incubation() {
        const url = `https://api.xter.io/palio/v1/user/${this.address}/incubation`;
        return this.get(url);
    }

    async prop(propId) {
        const url = `https://api.xter.io/palio/v1/user/${this.address}/prop`;
        const body = {"prop_id":propId};
        return await this.post(url, body);
    }

    /**
     * 积分
     * @returns 
     */
    async point() {
        const url = `https://api.xter.io/palio/v1/user/${this.address}/point`;
        return this.get(url);
    }

    /**
     * 票数
     * @returns 
     */
    async ticket() {
        const url = `https://api.xter.io/palio/v1/user/${this.address}/ticket`;
        return this.get(url, {})
    }

    /**
     * 获取签名
     * @returns 
     */
    async getSignMessage() {
        try {
            const response = await this.axiosInstance.get(`https://api.xter.io/account/v1/login/wallet/${this.address}`, {
                headers: {
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "authorization": "",
                    "content-type": "application/json",
                    "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    'sensorsdatajssdkcross': `%7B%22distinct_id%22%3A%22${this.devices}%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22${this.identities}%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%22%2C%22value%22%3A%22%22%7D%2C%22%24device_id%22%3A%22${this.devices}%22%7D`,
                    "Referer": "https://xter.io/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                }
            });
    
            const respData = response.data;
            if (respData.err_code !== 0) {
                throw new Error(`${this.address} Request Error: ${JSON.stringify(respData)}`);
            }
    
            return respData.data.message;
        } catch (error) {
            throw new Error(`${this.address} Request Error: ${error.message}`);
        }
    }
    
    /**
     * 登录
     * @param sign 
     * @returns 
     */
    async wallet_login(sign: string) {
        try {
            const response = await this.axiosInstance.post('https://api.xter.io/account/v1/login/wallet', {
                address: this.address,
                type: 'eth',
                sign: sign,
                provider: 'METAMASK',
                invite_code: ''
            }, {
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
                }
            });
    
            return response?.data;
        } catch (error) {
            console.error('登录失败', error);
            if (error instanceof AxiosError) {
                return error?.response?.data;
            }
            return null;
        }
    }
    

}
