import Axios, { AxiosError } from "axios";
import { ethers } from "ethers";

import { getIncubatorABI, getVoteABI } from './abi';
import {LogUtil} from './logUtil';

export class ChainAbi{
    contract: ethers.Contract;
    voteContract: ethers.Contract;
    privateKey: string;
    address: string;
    wallet: ethers.Wallet;
    constructor(privateKey:string, address:string) {
        this.address = address;
        this.privateKey = privateKey;
        //provider
        const providerUrl = 'http://xterio.rpc.huashui.ren/';
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        //wallet
        this.wallet = new ethers.Wallet(this.privateKey, provider);
        //Incubator contract
        const contractAddress = '0xBeEDBF1d1908174b4Fc4157aCb128dA4FFa80942'
        const ABI = getIncubatorABI();
        this.contract = new ethers.Contract(contractAddress, ABI, this.wallet);
        //vote contract
        const voteContractAddress = "0x73e987FB9F0b1c10db7D57b913dAa7F2Dc12b4f5";
        const voteABI = getVoteABI();
        this.voteContract = new ethers.Contract(voteContractAddress, voteABI, this.wallet);
    }


    async checkChatNFTClaimStatusBatch() {
        const method = 'checkChatNFTClaimStatusBatch';
        const result = await this.contract.checkChatNFTClaimStatusBatch(this.address);
        LogUtil.info(`${this.address} ${method} ${result}`);
        return result;
    }

    async claimChatNFT() {
        const method = 'claimChatNFT';
        let balance = await this.wallet.getBalance();
        let needGas = await this.contract.estimateGas[method]();
        if (balance.lt(needGas)) {
            console.log(`${this.address} Can't ClaimChatNFT, need gas: ${ethers.utils.formatEther(needGas)}, but balance=${ethers.utils.formatEther(balance)}`);
            return null
        }
        const trans = await this.contract[method]();
        LogUtil.info(`${this.address} claimChatNFT transHash=${trans.hash}`);
        await trans.wait();
        return trans.hash;
    }

    async claimedUtilitiesTodayBatch() {
        // 查询当日是否能mint 道具？
        const method = 'claimedUtilitiesTodayBatch';
        const result = await this.contract[method](
            this.address,
            [1,2,3],
        )
        LogUtil.info(`${this.address} ${method} ${result}`);
        return result;
    }

    async claimUtility(idx) {
        // if ([1,2,3].includes(idx)) {
        //     throw new Error(`${this.address} claimUnility ${idx} error, idx error`);
        // }
        const method = 'claimUtility';
        const needGas = await this.contract.estimateGas[method](idx);
        const balance = await this.wallet.getBalance();
        if (balance.lt(needGas)) {
            throw new Error(`${this.address} not enough coin to mint ${idx} palio, balance=${ethers.utils.formatEther(balance)}, need=${ethers.utils.formatEther(needGas)}`);
        }
        const trans = await this.contract[method](idx);
        LogUtil.info(`${this.address} claimUnility ${idx} hash=${trans.hash}`);
        await trans.wait();
        return trans.hash;
    }

    async vote(num:number, totalNum:number) {
        const method = 'vote';
        const result = await this.voteContract[method](
            this.address,
            1,
            num,
            totalNum
        )
        LogUtil.info(`${this.address} ${method} ${result}`);
        return result;
    }

    async userVotedAmt() {
        const method = 'userVotedAmt';
        const result = await this.voteContract[method](
            this.address
        )
        LogUtil.info(`${this.address} ${method} ${result}`);
        return result;
    }


}