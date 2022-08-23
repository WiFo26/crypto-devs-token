require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({path: '.env'})

const ALCHEMY_API_URL = process.env.ALCHEMY_API_KEY_URL
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'rinkeby',
  solidity: "0.8.9",
  networks: {
    "rinkeby": {
      url: ALCHEMY_API_URL,
      accounts: [RINKEBY_PRIVATE_KEY]
    }
  }
};
