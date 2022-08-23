const { ethers } = require("hardhat");
const { CRYPTO_DEV_NFT_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  
  const CryptoDevToken = await ethers.getContractFactory("CryptoDevToken");
  const cryptoDevToken = await CryptoDevToken.deploy(CRYPTO_DEV_NFT_CONTRACT_ADDRESS);
  await cryptoDevToken.deployed()
  console.log(`
    CryptoDevToken contract address: ${cryptoDevToken.address}
  `)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
