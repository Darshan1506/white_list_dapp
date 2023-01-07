require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/fPoaWiIHlWd6j4CEvgZN6sKzG_0Dgygp",
      accounts: [PRIVATE_KEY],
    },
  },
};
