import { ethers } from "ethers";
import dayjs from 'dayjs';
import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../../config/config.json'
import {writeFile} from './utils';



export function createWallet(number = config.createWallet.num) {
    const wallets = []
    for (let i = 0; i < number; i++) {
        const { privateKey, address } = ethers.Wallet.createRandom();
        wallets.push({
            index: i + 1,
            address,
            privateKey
        })
    }
    writeFile(`data/account_${Date.now()}.txt`, wallets.map(wallet => `${wallet.address}----${wallet.privateKey}`).join('\n'));
}
createWallet()

export default createWallet;
