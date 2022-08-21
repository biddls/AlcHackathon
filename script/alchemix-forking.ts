import {ethers, network} from "hardhat";
import fs from "fs";
import path from "path";
import {expect} from "chai";

class AlchemixSuite{
    private names: string[];
    private contracts: { [key: string]: any; };
    private devMS: any;
    constructor(){
        // loads contracts
        this.contracts = {};
        const fs = require('fs');
        const path = require('path')

        const jsonsInDir = fs.readdirSync('./v2-contracts-master/deployments/mainnet').filter((file: any) => path.extname(file) === '.json');
        this.names = jsonsInDir

        jsonsInDir.forEach(async (file: any) => {
            const fileData = fs.readFileSync(path.join('./v2-contracts-master/deployments/mainnet', file));
            const json = JSON.parse(fileData.toString());
            this.contracts[file] = await ethers.getContractAt(
                json["abi"],
                json["address"],
            );
        });
    }

    async impersonates_devMS() {
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x9e2b6378ee8ad2A4A95Fe481d63CAba8FB0EBBF9"],
        });
        this.devMS = await ethers.provider.getSigner(
            "0x9e2b6378ee8ad2A4A95Fe481d63CAba8FB0EBBF9"
        );

        await this.getContract("Whitelist_alETH_Alchemist.json").connect(this.devMS).disable()
        expect(await this.getContract("Whitelist_alETH_Alchemist.json").disabled()).to.be.true;
    }

    getNames(){
        return this.names;
    }

    getContract(_name: string){
        try {return this.contracts[_name]}
        catch (e: unknown) {
            return "contract doesnt exist"
        }
    }

    getContracts(){
        return this.contracts
    }

    async addAddrToWhitelist(addr: string) {
        await this.getContract("Whitelist_alETH_Alchemist.json").connect(this.devMS).add(addr)
        expect(
            await this.getContract("Whitelist_alETH_Alchemist.json")
                .connect(this.devMS)
                .isWhitelisted()
        ).to.be.true;
    }

    getDevMS(){
        return this.devMS
    }
}

export default AlchemixSuite;