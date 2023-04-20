const { ethers } = require("hardhat");

async function main() {
    // Fetch contract to deploy
    const Token = await ethers.getContractFactory("Token");

    // Deploy contract
    // write to blockchain
    const token = await Token.deploy();
    await token.deployed()
    // retrieve copy once token is deployed
    console.log(`Token Deployed to: ${token.address}`)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});