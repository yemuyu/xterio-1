import { ethers } from "ethers";
import { Buffer } from "buffer";
const qs = require('qs');
import { getDeviceId } from './utils';
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
    constructor(address:string, id_token:string) {
        this.address = address;
        this.deviceid = getDeviceId();
        this.axiosInstance = httpUtil.getProxy();
        this.access_token = null;
        this.id_token = id_token;
        this.refresh_token = null;
        this.is_new = null; // 0 = true, 1 = false;
        this.config = null;
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

// async post(url: string, body: any) {
//     LogUtil.info(`${this.address} POST: ${url} - ${JSON.stringify(body)}`);
//     const resp = await fetch(url, {
//         headers: {
//             "accept": "*/*",
//             "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
//             "authorization": this.id_token,
//             "content-type": "application/json",
//             "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
//             "sec-ch-ua-mobile": "?0",
//             "sec-ch-ua-platform": "\"macOS\"",
//             "sec-fetch-dest": "empty",
//             "sec-fetch-mode": "cors",
//             "sec-fetch-site": "same-site",
//             // "sensorsdatajssdkcross": this.getSensorsdata(),
//             "Referer": "https://xter.io/",
//             "Referrer-Policy": "strict-origin-when-cross-origin"
//         },
//         body: JSON.stringify(body),
//         method: "POST"
//     });
//     const text = await resp.text();
//     LogUtil.info(`${this.address} POST Return: ${text}`);
//     let respData;
//     try {
//         respData = JSON.parse(text);
//     } catch (error) {
//         throw new Error(`${this.address} Request:POST ${url}-${JSON.stringify(body)} Error: Invalid JSON response`);
//     }
//     if (respData.err_code !== 0) {
//         throw new Error(`${this.address} Request:POST ${url}-${JSON.stringify(body)} Error: ${text}`);
//     }
//     return respData.data;
// }


// async get(url:string, params={}) {
//     if (params) {
//         url = `${url}?${qs.stringify(params)}`;
//     }
//     LogUtil.info(`${this.address} GET: ${url} - ${JSON.stringify(params)}`);
//     const resp = await fetch(url, {
//         "headers": {
//             "accept": "*/*",
//             "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
//             "authorization": this.id_token,
//             "content-type": "application/json",
//             "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
//             "sec-ch-ua-mobile": "?0",
//             "sec-ch-ua-platform": "\"macOS\"",
//             "sec-fetch-dest": "empty",
//             "sec-fetch-mode": "cors",
//             "sec-fetch-site": "same-site",
//             // "sensorsdatajssdkcross": this.getSensorsdata(),
//             "Referer": "https://xter.io/",
//             "Referrer-Policy": "strict-origin-when-cross-origin"
//         },
//         "body": null,
//         "method": "GET"
//     });
//     const text = await resp.text();
//     LogUtil.info(`${this.address} GET Return: ${text}`);
//     const respData = JSON.parse(text);
//     if (respData.err_code !== 0) {
//         throw new Error(`${this.address} Request:GET ${url} Error: ${text}`);
//     }
//     return respData.data;
// }

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
}
