import * as ethers from "ethers";

function bscSwapXter(privateKey:string) {
    const ethersProvider = ethers.getDefaultProvider('mainnet')
    const ethersWallet = new ethers.Wallet(privateKey, ethersProvider);

    //provider
    const xterProviderUrl = 'http://xterio.rpc.huashui.ren/';
    const xterProvider = new ethers.providers.JsonRpcProvider(xterProviderUrl);
    //wallet
    const xterWallet = new ethers.Wallet(this.privateKey, xterProvider);
}