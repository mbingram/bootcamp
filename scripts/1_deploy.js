const { ethers } = require("hardhat");

async function main() {
    console.log(`Preparing deployment...\n`)
    // Fetch contract to deploy
    const Token = await ethers.getContractFactory('Token');
    const Exchange = await ethers.getContractFactory('Exchange');
    // Fetch accounts
    const accounts = await ethers.getSigners();

    console.log(`Accounts fetched: \n${accounts[0].address}\n${accounts[1].address}\n`)

    // Deploy Token contract (for MBC, mETH and mDAI)
    const mbc = await Token.deploy('Mary Bellpepper Coin', 'MBC', '1000000')
    await mbc.deployed()
    console.log(`MBC Token Deployed to: ${mbc.address}`)

    const mETH = await Token.deploy('mETH', 'mETH', '1000000')
    await mETH.deployed()
    console.log(`mETH Token Deployed to: ${mETH.address}`)

    const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000')
    await mDAI.deployed()
    console.log(`mDAI Token Deployed to: ${mDAI.address}`)

    const exchange = await Exchange.deploy(accounts[1].address, 10)
    await exchange.deployed()
    console.log(`Exchange deployed to: ${exchange.address}`)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
});