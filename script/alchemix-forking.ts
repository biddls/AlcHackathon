import {ethers} from "hardhat";

class AlchemixSuite{
    private names: string[];
    private contracts: { [key: string]: any; };
    constructor(){
        this.contracts = {};
        const fs = require('fs');
        const path = require('path')

        const jsonsInDir = fs.readdirSync('./v2-contracts-master/deployments/mainnet').filter((file: any) => path.extname(file) === '.json');
        this.names = jsonsInDir

        jsonsInDir.forEach((file: any) => {
            const fileData = fs.readFileSync(path.join('./v2-contracts-master/deployments/mainnet', file));
            const json = JSON.parse(fileData.toString());
            this.contracts[file] = new ethers.Contract(
                json["address"],
                json["abi"],
                ethers.provider);
        });
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
}

export default AlchemixSuite;