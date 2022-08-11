const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    // TODO: Add me
    // const tokenAuthority = "0x...";

    const deploymentFactory = await ethers.getContractFactory("AlkahestERC20Token");

    // TODO: Add a token authority here to manage the deployment
    const deployment = await deploymentFactory.deploy(/*tokenAuthority*/);

    console.log("AlkahestERC20Token Deployment: " + deployment.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })