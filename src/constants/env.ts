import {parseBoolean} from "../utilities/utils";

import {config as dotenvConfig} from "dotenv";
import {resolve} from "path";

dotenvConfig({path: resolve(__dirname, "../../.env")});

const {
    NETWORK,
    NETWORK_FORK,

    MAINNET_RPC_URL__LIVE,
    MAINNET_RPC_URL__FORK,

    GOERLI_RPC_URL__LIVE,
    GOERLI_RPC_URL__FORK,

    ETHERSCAN_API_KEY,

    PRIVATE_KEY,
    PRIVATE_KEY_MNEMONIC,
} = process.env;

export const env = {
    NETWORK,
    NETWORK_FORK: parseBoolean(NETWORK_FORK),
    ETHEREUM_RPC_URL: (
        NETWORK === "MAINNET" ?
            parseBoolean(NETWORK_FORK) ? MAINNET_RPC_URL__FORK : MAINNET_RPC_URL__LIVE
            : NETWORK === "GOERLI" ?
                parseBoolean(NETWORK_FORK) ? GOERLI_RPC_URL__FORK : GOERLI_RPC_URL__LIVE
                : "UNDEF"
    ) as string,

    ETHERSCAN_API_KEY: ETHERSCAN_API_KEY as string,

    PRIVATE_KEY: PRIVATE_KEY as string,
    PRIVATE_KEY_MNEMONIC: PRIVATE_KEY_MNEMONIC as string,

    // Manually referencable networks
    __MAINNET_RPC_URL__LIVE: MAINNET_RPC_URL__LIVE,
    __MAINNET_RPC_URL__FORK: MAINNET_RPC_URL__FORK,
    __GOERLI_RPC_URL__LIVE: GOERLI_RPC_URL__LIVE,
    __GOERLI_RPC_URL__FORK: GOERLI_RPC_URL__FORK,
}