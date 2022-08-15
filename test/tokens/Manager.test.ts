import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {now} from "../../script/now"

import {
    Manager,    Manager__factory,
    ERC20PresetMinterPauser,    ERC20PresetMinterPauser__factory
} from '../../types';

let managerFactory: Manager__factory;
let ERC20Factory: ERC20PresetMinterPauser__factory;


describe("Manager Testing", async function () {
    let deployer: SignerWithAddress;

    let vault: SignerWithAddress;
    let strategist: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;

    let manager: Manager;
    let erc20: ERC20PresetMinterPauser;

    let Oaddr: string = "0x0000000000000000000000000000000000000000";
    let maxInt: BigInt = BigInt(2**256) - BigInt(1);
    const year = 365.2422 * 86400;

    before(async function () {

        // Initialize accounts
        [deployer, vault, strategist, alice, bob] = await ethers.getSigners();

        // create factory
        managerFactory = new Manager__factory(deployer);
        ERC20Factory = new ERC20PresetMinterPauser__factory(deployer);
    });

    beforeEach(async function () {
        // Create Token
        // tok = await TokenFactory.deploy();
        // manager = await managerFactory.deploy();

    });

    it("alk setup", async () => {
    });

    describe("deploy sample Manager", async function () {

        const ten = ethers.utils.parseEther("10")

        beforeEach(async function () {
            erc20 = await ERC20Factory.deploy("alTest", "ALT");
        });

        it("Normal deployment", async function (){
            const _yield = ethers.utils.parseEther("0.5") // 50% return over the course of the bond

            manager = await managerFactory.deploy(
                erc20.address,
                _yield,
                Math.floor(year * 10),
                now() + 10,
                18);

            expect(await manager.token()).to.be.equal(erc20.address);
        });
    });
});
