import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {ethers} from "hardhat";

// import {
// } from '../../types';

// let TokenFactory: factory;

describe.skip("alkahestToken", function () {
    let deployer: SignerWithAddress;

    let vault: SignerWithAddress;
    let strategist: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;

    // let tok: Token;

    let Oaddr: string = "0x0000000000000000000000000000000000000000";
    let maxInt: BigInt = BigInt(2**256) - BigInt(1);

    before(async () => {
        
        // Initialize accounts
        [deployer, vault, strategist, alice, bob] = await ethers.getSigners();

        // TokenFactory = new Token__factory(deployer);
    });

    beforeEach(async function () {
        // Create Token
        // tok = await TokenFactory.deploy();
    });

    it("alk setup", async () => {
    });

    describe.skip("alk transfers time bonus", function () {

        const ten = ethers.utils.parseEther("10")

        beforeEach(async function () {
            // await tok.mint(alice.address, ten);
            // expect(await tok.balanceOf(alice.address)).to.equal(ten);
        });
    });
});
