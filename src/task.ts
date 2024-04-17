//道具
import Axios, { AxiosError } from "axios";
import  { HttpsProxyAgent }  from "https-proxy-agent/dist";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import config from '../config/config.json';
import {getInviteCode, getToken } from './libs/utils';
import { getDeviceId, getChatAnswer } from './libs/utils';
import {XterApi} from './libs/api'
import { ChainAbi } from './libs/chainAbi';
import {LogUtil} from './libs/logUtil'

//私钥
let keyPairs: string | any[];

class task {
  
    axios: any;
    address: string;
    privateKey: string;
    id_token: string;
    proxyAgent: any;
    api: XterApi;
    chainAbi: ChainAbi;
    //构造函数 创建对象初始化对象属性
    constructor(address:string, privateKey:string, id_token:string, proxy:string) {
        // 代理没用上，应该放到XterApi中，发送api请求时使用axios
        this.proxyAgent = new HttpsProxyAgent(proxy);
        this.axios = Axios.create({
            proxy: false,
            httpsAgent: this.proxyAgent,
        });
        this.address = address;
        this.privateKey = privateKey;
        this.api = new XterApi(this.address, id_token);
        this.chainAbi = new ChainAbi(this.privateKey, this.address);
    }

    /**
     * 领取道具
     */
    async claimUtility() {
        let statusList = await this.chainAbi.claimedUtilitiesTodayBatch();
        for(let i in statusList) {
            const status = statusList[i];
            if (status.eq(ethers.utils.parseEther('0'))) {
                LogUtil.info(`没有Mint: ${i+1} 道具，开始Mint`);
                await this.chainAbi.claimUtility(i + 1);
                LogUtil.info(`Mint: ${i+1} 道具完成`);
            }
        }
    }

    /**
     * 投喂道具
     */
    async feedUtility() {
        await this.chainAbi.claimedUtilitiesTodayBatch();
        const incubation = await this.api.incubation();
        for(let prop of incubation.props) {
            let total = prop.total;
            let cons_total = prop.cons_total;
            if (total > cons_total) {
                LogUtil.info(`投喂道具: ${prop.props_id}`)
                await this.api.prop(prop.props_id);
            }
        }
    }

    /**
     * 填邀请码
     */
    async setInviteCode() {
        const inviteCode = await this.api.inviteCode();
        //code：自己的邀请码，activate_code：填入的别人邀请码
        const {activate_code, code} = inviteCode;
        if (activate_code === '' && !inviteCode.eq(activate_code)) {
            // 填入别人的邀请码
            const activateCode = getInviteCode();
            LogUtil.info(`${this.address} 没有设置邀请码, 设置邀请码: ${activateCode}`)
            await this.api.apply(activateCode);
        } else {
            LogUtil.info(`已经设置过邀请码了: ${activate_code}`);
        }
    }

    /**
     * chat nft
     * @returns 
     */
    async mintChatNft() {
        const now = Math.floor(Date.now() / 1000);
        let config = await this.api.getConfig();
        const stageList = config.list || [];
        const stage = stageList.filter(s => {
            return now >= s.start && now <= s.end;
        })[0]
        LogUtil.info(`now stage: ${JSON.stringify(stage)}`);
        const stageIndex = stage.index - 1;
        let hasMintList = await this.chainAbi.checkChatNFTClaimStatusBatch();
        let minted = hasMintList[stageIndex];
        LogUtil.info(`ChatNft Mint status: ${minted}`);
        if (minted === true) {
            return
        }
        let { max_score, retry} = await this.api.chat();
        // 答题
        for(let i = retry; i < 4; i++) {
            if (max_score >= 91) {
                break;
            }
            LogUtil.info(`max_score=${max_score}, retry=${retry}`);
            let answer = getChatAnswer(stage.name);
            LogUtil.info(`Answer=${answer}`);
            await this.api.talk(answer);
            let chat = await this.api.chat();
            max_score = chat.max_score;
            retry = chat.retry;
        }
        LogUtil.info(`chat max_score=${max_score}, begin mint chatNFT`);
        await this.chainAbi.claimChatNFT();
    }

    /**
     * 投票
     */
    async vote() {
        const userVotedAmt = await this.chainAbi.userVotedAmt();
        const {total_ticket} = await this.api.ticket();
        const num = total_ticket - userVotedAmt;
        LogUtil.info(`总票数：${total_ticket}, 已投票数：${userVotedAmt}, 剩余票数：${num}`);
        if(num > 0) {
            this.chainAbi.vote(1, total_ticket);
        }
    }

    /**
     * 数据统计
     */
    async summary() {
        const { boost, point, rank, invited_num} = await this.api.point();
        const {total_ticket} = await this.api.ticket();
        LogUtil.info(`boost=${boost.map(p=>p.value+'').join('+')}, point=${point.map(p=>p.value+'').join(' + ')}, rank=${rank}, invitedNum=${invited_num}, ticket=${total_ticket}`);
    }


    async Run() {
        // LogUtil.info('领取道具任务开始...')
        // await this.claimUtility();
        // LogUtil.info('投喂道具任务开始...')
        // await this.feedUtility();
        // LogUtil.info('填邀请码任务开始...')
        // await this.setInviteCode();
        // LogUtil.info("chat NFT任务开始")
        // await this.mintChatNft();
        // this.summary();
        LogUtil.info("投票任务开始")
        await this.vote();
        LogUtil.info("投票任务结束")
    }
  
}

function Run() {
    console.log('执行任务...');
    keyPairs = getToken();
    const proxy = config.proxy.address;
    for (let i = 0; i < keyPairs.length; i++) {
        const address = keyPairs[i].address;
        const privateKey = keyPairs[i].privateKey;
        const id_token = keyPairs[i].token;
        console.log(`第${i}个，地址：${address}:Run...`);
        const myTask = new task(address, privateKey, id_token, proxy);
         myTask.Run();
    }
}


Run();
