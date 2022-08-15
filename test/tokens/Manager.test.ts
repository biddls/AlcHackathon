import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {now} from "../../script/now"
import AlchemixSuite from "../../script/alchemix-forking";

import {
    Manager,    Manager__factory,
    ERC20PresetMinterPauser,    ERC20PresetMinterPauser__factory,
    Util,       Util__factory
} from '../../types';


let managerFactory: Manager__factory;
let ERC20Factory: ERC20PresetMinterPauser__factory;
let UtilFactory: Util__factory;


describe("Manager Testing", async function () {
    let deployer: SignerWithAddress;

    let vault: SignerWithAddress;
    let strategist: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;

    let manager: Manager;
    let erc20: ERC20PresetMinterPauser;
    let al_erc20: ERC20PresetMinterPauser;
    let util: Util;

    let Oaddr: string = "0x0000000000000000000000000000000000000000";
    let maxInt: BigInt = BigInt(2**256) - BigInt(1);
    const year = 365.2422 * 86400;
    let alchemixSuite: AlchemixSuite;

    before(async function () {
        // Initialize test suite
        alchemixSuite = new AlchemixSuite();
        // console.log(alchemixSuite.getNames());

        // Initialize accounts
        [deployer, vault, strategist, alice, bob] = await ethers.getSigners();

        // create factory
        managerFactory = new Manager__factory(deployer);
        ERC20Factory = new ERC20PresetMinterPauser__factory(deployer);
        UtilFactory = new Util__factory(deployer);
        util = await UtilFactory.deploy();
    });

    beforeEach(async function () {
        // Create Token
        // tok = await TokenFactory.deploy();
        // manager = await managerFactory.deploy();

    });

    it.skip("setup", async () => {
    });

    describe("deploy sample Manager", async function () {

        const ten = ethers.utils.parseEther("10")

        beforeEach(async function () {
            erc20 = await ERC20Factory.deploy("Test", "T");
            al_erc20 = await ERC20Factory.deploy("alTest", "ALT");
        });

        it("Normal deployment", async function (){
            const _yield = ethers.utils.parseEther("0.5"); // 50% return over the course of the bond
            const start = BigInt(now()) + BigInt(200);

            manager = await managerFactory.deploy(
                erc20.address,
                al_erc20.address,
                alchemixSuite.getContract("AlchemistV2_alETH.json").address,
                _yield,
                Math.floor(year * 10),
                start,
                18);

            expect(await manager.token()).to.be.equal(erc20.address);
            expect(await manager.yield()).to.be.equal(_yield);
            expect(await manager.duration()).to.be.equal(Math.floor(year * 10));
            expect(await manager.cutOffTime()).to.be.equal(start);
            expect(await manager.shareScaler()).to.be.equal(ethers.utils.parseEther("1"));
        });

        it("early cut off", async function (){
            const _yield = ethers.utils.parseEther("0.5"); // 50% return over the course of the bond
            const start = BigInt(now()) - BigInt(200);
            // console.log(start, (await util._now()).toString());

            await expect(managerFactory.deploy(
                erc20.address,
                al_erc20.address,
                alchemixSuite.getContract("AlchemistV2_alETH.json").address,
                _yield,
                Math.floor(year * 10),
                start,
                18)).to.be.revertedWith("Cut off < time");
        });

        it("yield is to high", async function (){
            const _yield = ethers.utils.parseEther("1.1"); // 50% return over the course of the bond
            const start = BigInt(now()) + BigInt(200);
            // console.log(start, (await util._now()).toString());

            await expect(managerFactory.deploy(
                erc20.address,
                al_erc20.address,
                alchemixSuite.getContract("AlchemistV2_alETH.json").address,
                _yield,
                Math.floor(year * 10),
                start,
                18)).to.be.revertedWith("yield too high");
        });
    });
});
