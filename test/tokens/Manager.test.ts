import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
const { expect, use } = require('chai');
import { network, ethers } from "hardhat";
import {now} from "../../script/now"
import AlchemixSuite from "../../script/alchemix-forking";

import chai from "chai";

const { solidity } = require('ethereum-waffle');

use(solidity);

chai.use(solidity);

import {
    Manager,    Manager__factory,
    Util,       Util__factory
} from '../../types';

import {beforeEach} from "mocha";
import {BigNumber} from "ethers";

// rETH = "0xae78736Cd615f374D3085123A210448E74Fc6393"
// yvWETH = "0xa258C4606Ca8206D8aA700cE2143D7db854D168c"
// alETH Alchemist V2 = "0x062Bf725dC4cDF947aa79Ca2aaCCD4F385b13b5c"
// alETH = "0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6"

let yvWETH_wales = [
    "0x53a393fbc352fad69baedefa46c4c1085bb6d707",
    "0xbd4a00764217c13a246f86db58d74541a0c3972a",
    "0xa01d3d567bf666b292ca02f25e6fb37a6a55008e"
]

let managerFactory: Manager__factory;
let UtilFactory: Util__factory;


describe("Manager Testing", async function () {
    let deployer: SignerWithAddress;

    let alice1: SignerWithAddress;
    let bob1: SignerWithAddress;
    let alice2: SignerWithAddress;
    let bob2: SignerWithAddress;

    let manager: Manager;
    let util: Util;

    let Oaddr: string = "0x0000000000000000000000000000000000000000";
    let maxInt: BigInt = BigInt(2**256) - BigInt(1);

    const year = 365.2422 * 86400;
    let alchemixSuite: AlchemixSuite;

    before(async function () {
        // Initialize test suite
        alchemixSuite = new AlchemixSuite();
        await alchemixSuite.impersonates_devMS();
        // console.log(alchemixSuite.getNames());

        // Initialize accounts
        [deployer, alice1, bob1, alice2, bob2] = await ethers.getSigners();

        // create factory
        managerFactory = new Manager__factory(deployer);
        UtilFactory = new Util__factory(deployer);
        util = await UtilFactory.deploy();

        // setup whales to be impersonated
        for (const element of yvWETH_wales) {
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [element],
            });
        }
    });

    beforeEach(async function () {
        // Create Token
        // tok = await TokenFactory.deploy();
        // manager = await managerFactory.deploy();
    });

    describe("deploy sample Manager", async function () {

        const ten = ethers.utils.parseEther("10")

        it("Normal deployment", async function (){
            const _yield = ethers.utils.parseEther("0.5"); // 50% return over the course of the bond
            const start = BigInt(now()) + BigInt(200);

            manager = await managerFactory.deploy(
                alchemixSuite.getContract("yvWETH.json").address,
                alchemixSuite.getContract("AlEth.json").address,
                alchemixSuite.getContract("AlchemistV2_alETH.json").address,
                _yield,
                Math.floor(year * 10),
                start,
                18);

            expect(await manager.positionIndex()).to.be.equal(1);
            expect(await manager.token()).to.be.equal(alchemixSuite.getContract("yvWETH.json").address);
            expect(await manager.alToken()).to.be.equal(alchemixSuite.getContract("AlEth.json").address);
            expect(await manager.alchemistV2()).to.be.equal(alchemixSuite.getContract("AlchemistV2_alETH.json").address);
            expect(await manager.yield()).to.be.equal(_yield);
            expect(await manager.duration()).to.be.equal(Math.floor(year * 10));
            expect(await manager.cutOffTime()).to.be.equal(start);
            expect(await manager.shareScaler()).to.be.equal(ethers.utils.parseEther("1"));
            expect(await manager.end()).to.be.equal(start + BigInt(Math.floor(year * 10)));
            expect(await manager.sharesStable()).to.be.equal(0);
            expect(await manager.sharesVariable()).to.be.equal(0);
            expect(await manager.stage()).to.be.equal(0);
        });

        it("early cut off", async function (){
            const _yield = ethers.utils.parseEther("0.5"); // 50% return over the course of the bond
            const start = BigInt(now()) - BigInt(200);
            // console.log(start, (await util._now()).toString());

            await expect(managerFactory.deploy(
                alchemixSuite.getContract("yvWETH.json").address,
                alchemixSuite.getContract("AlEth.json").address,
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
                alchemixSuite.getContract("yvWETH.json").address,
                alchemixSuite.getContract("AlEth.json").address,
                alchemixSuite.getContract("AlchemistV2_alETH.json").address,
                _yield,
                Math.floor(year * 10),
                start,
                18)).to.be.revertedWith("yield too high");
        });
    });

    describe("join bond", async function () {

        beforeEach( async function () {
            const _yield = ethers.utils.parseEther("0.5"); // 50% return over the course of the bond
            const start = BigInt(now()) + BigInt(200);

            manager = await managerFactory.deploy(
                alchemixSuite.getContract("yvWETH.json").address,
                alchemixSuite.getContract("AlEth.json").address,
                alchemixSuite.getContract("AlchemistV2_alETH.json").address,
                _yield,
                Math.floor(year * 10),
                start,
                18);
        })

        const ten = ethers.utils.parseEther("10")

        it("Normal proposing", async function (){
            // impersonate yvWETH whale
            const whale1 = await ethers.provider.getSigner(
                yvWETH_wales[0]
            );

            await manager.connect(whale1).join(
                true,
                1,
                0
                );

            const output = await manager.positions(1)
            expect(output.stable).to.be.true;
            expect(output.active).to.be.false;
            expect(output.receiver).to.be.equal(whale1._address);
            expect(output.shares).to.be.equal(1);
            expect(output.sinceLast).to.be.above(now());
            // console.log(output.sinceLast, now())
        });

        it("Normal matching", async function (){
            // impersonate yvWETH whale
            const whale1 = await ethers.provider.getSigner(
                yvWETH_wales[0]
            );
            // impersonate yvWETH whale
            const whale2 = await ethers.provider.getSigner(
                yvWETH_wales[1]
            );

            //set approvals
            alchemixSuite.getContract("yvWETH.json").connect(whale1).approve(manager.address, ten)
            alchemixSuite.getContract("yvWETH.json").connect(whale2).approve(manager.address, ten)

            await manager.connect(whale1).join(
                true,
                1,
                0
                );

            await manager.connect(whale1).join(
                false,
                1,
                1
                );
        });
    });

    describe("bond test full", async function () {

        const ten = ethers.utils.parseEther("10")

        it("life cycle", async function (){
            const _yield = ethers.utils.parseEther("0.5"); // 50% return over the course of the bond
            const start = BigInt(now()) + BigInt(200);

            manager = await managerFactory.deploy(
                alchemixSuite.getContract("yvWETH.json").address,
                alchemixSuite.getContract("AlEth.json").address,
                alchemixSuite.getContract("AlchemistV2_alETH.json").address,
                _yield,
                Math.floor(year * 10),
                start,
                18);

            // impersonate yvWETH whale
            const whale1 = await ethers.provider.getSigner(
                yvWETH_wales[0]
            );
            // impersonate yvWETH whale
            const whale2 = await ethers.provider.getSigner(
                yvWETH_wales[1]
            );

            //set approvals
            alchemixSuite.getContract("yvWETH.json").connect(whale1).approve(manager.address, ten)
            alchemixSuite.getContract("yvWETH.json").connect(whale2).approve(manager.address, ten)

            await manager.connect(whale1).join(
                true,
                1,
                0
            );

            await manager.connect(whale2).join(
                false,
                1,
                1
            );

            // fast forwards time
            await network.provider.send("evm_increaseTime", [3600]);
            await network.provider.send("evm_mine");

            await manager.startBond();

            expect(
                await alchemixSuite
                    .getContract("AlEth.json")
                    .balanceOf(manager.address)
            ).to.be.equal(ethers.utils.parseEther("0.5"));

            // fast forwards by 1 year
            // the yield for stable should be 10% for the 50% total return
            // as the bond is for 10 years
            await network.provider.send("evm_increaseTime", [31557600]);
            await network.provider.send("evm_mine");

            // console.log((await alchemixSuite
            //     .getContract("AlEth.json")
            //     .balanceOf(whale1._address)).toString())

            await manager.connect(whale1).claim(1);

            expect(
                await alchemixSuite
                    .getContract("AlEth.json")
                    .balanceOf(whale1._address)
            ).to.be.above(ethers.utils.parseEther("0.05"));

            // fast forwards by 10 years
            // the yield for stable should be 90% for the 50% total return
            // as the bond is for 10 years, @1 year it was reddemed
            await network.provider.send("evm_increaseTime", [31557600 * 10]);
            await network.provider.send("evm_mine");

            await manager.connect(whale1).claim(1);

            // console.log((await alchemixSuite
            //     .getContract("AlEth.json")
            //     .balanceOf(whale1._address)).toString())

            // ensure that with the end of the bond all the yield has been returned
            expect(
                await alchemixSuite
                    .getContract("AlEth.json")
                    .balanceOf(whale1._address)
            ).to.be.below(ethers.utils.parseEther("0.5"));

            expect(
                await alchemixSuite
                    .getContract("AlEth.json")
                    .balanceOf(whale1._address)
            ).to.be.above(ethers.utils.parseEther("0.49"));
        });
    });
});
