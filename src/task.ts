//道具
import Axios, { AxiosError } from "axios";
import  { HttpsProxyAgent }  from "https-proxy-agent/dist";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import config from '../config/config.json';
import {getInviteCode, getPrivateKeys, getToken, saveToken } from './libs/utils';
import { getDeviceId, getChatAnswer } from './libs/utils';
import {XterApi} from './libs/api'
import { ChainAbi } from './libs/chainAbi';
import {LogUtil} from './libs/logUtil'

//私钥
let keyPairs: string | any[];

class task {
    address: string;
    privateKey: string;
    id_token: string;
    api: XterApi;
    chainAbi: ChainAbi;
    //构造函数 创建对象初始化对象属性
    constructor(address:string, privateKey:string, id_token:string) {
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
        if (activate_code === '') {
            const activateCode = getInviteCode();
            if(activateCode != activate_code) {
                // 填入别人的邀请码
                LogUtil.info(`${this.address} 没有设置邀请码, 设置邀请码: ${activateCode}`)
                await this.api.apply(activateCode);
            }
            
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

    // 签名信息
    async signMessage(message: string) {
        const wallet = new ethers.Wallet(this.privateKey);
        let signature = await wallet.signMessage(message);
        return signature;
    }

    async login(){
        console.log(`${this.address}，获得登录签名`)
        let wallet_message = await this.api.getSignMessage()
        if (wallet_message != undefined) {
            console.log("钱包签名")
            let signMessage = await this.signMessage(wallet_message);
            console.log(`签名信息:${signMessage}`)
            console.log('登录')
            let wallet_login = await this.api.wallet_login(signMessage)
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




    async Run() {
        LogUtil.info('填邀请码任务开始...')
        await this.setInviteCode();
        LogUtil.info('领取道具任务开始...')
        await this.claimUtility();
        LogUtil.info('领取道具任务完成...')
        LogUtil.info('投喂道具任务开始...')
        await this.feedUtility();
        LogUtil.info('投喂道具任务完成...')

        LogUtil.info("chat NFT任务开始")
        await this.mintChatNft();
        LogUtil.info("chat NFT任务完成")
        // this.summary();
        // LogUtil.info("投票任务开始")
        // await this.vote();
        // LogUtil.info("投票任务结束")
    }

    async RunOnce() {
        LogUtil.info('登录任务开始...')
        await this.login();
    }
  
}

function RunOnce() {
    console.log('执行一次任务...');
    keyPairs = getPrivateKeys();
    for (let i = 0; i < keyPairs.length; i++) {
        const address = keyPairs[i].address;
        const privateKey = keyPairs[i].privateKey;
        console.log(`第${i}个，地址：${address}:Run...`);
        const myTask = new task(address, privateKey, '');
         myTask.RunOnce();
    }
}

function Run() {
    console.log('执行每日任务...');
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
