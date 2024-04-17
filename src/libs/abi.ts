import { readFile } from "./utils";

export function getABI() {
    const relativeFilePath = 'data/abi.json';
    const data = readFile(relativeFilePath);
    return JSON.parse(data);
}

export function getIncubatorABI() {
    //读取abi.json中的palio_incubator下的abi
    const abi = getABI();
    return abi.palio_incubator.abi;
}

export function getVoteABI() {
    //读取abi.json中的vote下的abi
    const abi = getABI();
    return abi.palio_voter.abi;
}