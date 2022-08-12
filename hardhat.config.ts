import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import {HardhatUserConfig, subtask} from "hardhat/config";
import "hardhat-interface-generator";

import {env} from "./src/constants/env";
import {HardhatNetworkHDAccountsUserConfig} from "hardhat/src/types/config";
import {ETHER} from "./src/constants/constants";
import {TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS} from "hardhat/builtin-tasks/task-names";

subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS).setAction(
    async (_, __, runSuper) => {
        const paths = await runSuper();

        return paths.filter((p: string) => !p.endsWith(".skip.sol"));
    }
);

const baseAccounts: HardhatNetworkHDAccountsUserConfig = {
    mnemonic: env.PRIVATE_KEY_MNEMONIC,
    initialIndex: 5,
    count: 5,
    accountsBalance: ETHER.multipliedBy(100).toString(10) // ethers.utils.formatUnits(10, "ether")
};

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    gasReporter: {
        currency: "USD",
        enabled: true, //!!process.env.REPORT_GAS,
        excludeContracts: [],
        src: "./contracts",
    },
    networks: {
        // myNode: {
        //     url: "http://127.0.0.1:8546",
        //     accounts: baseAccounts
        // },
        hardhat: {
            forking: {
                url: env.ETHEREUM_RPC_URL,
                blockNumber: 14456320 // TODO: Define block
            },
            chainId: 1,
            accounts: baseAccounts,
            initialBaseFeePerGas: 0
        },
    },
    paths: {
        artifacts: "./artifacts",
        cache: "./cache",
        sources: "./contracts",
        tests: "./test"
    },
    solidity: {
        compilers: [
            {
                version: "0.8.11",
                settings: {
                    optimizer: {
                        enabled: false,
                        runs: 200
                    },
                }
            },
            // {
            //     version: "0.8.7",
            //     settings: {
            //         optimizer: {
            //             enabled: true,
            //             runs: 200
            //         },
            //     }
            // },
            // {
            //     version: "0.5.17",
            //     settings: {
            //         optimizer: {
            //             enabled: true,
            //             runs: 200
            //         },
            //     },
            // },
            // {
            //     version: "0.4.26",
            //     settings: {
            //         optimizer: {
            //             enabled: true,
            //             runs: 200
            //         },
            //     },
            // }
        ]
    },
    // namedAccounts: {
    //     deployer: {
    //         default: 0,
    //     },
    // },
    typechain: {
        outDir: "types",
        target: "ethers-v5",
    },
    // etherscan: {
    //     apiKey: process.env.ETHERSCAN_API_KEY,
    // },
};

export default config;