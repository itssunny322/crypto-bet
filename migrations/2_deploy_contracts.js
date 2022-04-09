const DAI = artifacts.require("DAI");
const BetOracle = artifacts.require("BetOracle")
const Bet = artifacts.require("Bet")

module.exports = async function (deployer,networks,accounts) {
  await deployer.deploy(DAI,"DAI","$");
  await deployer.deploy(BetOracle);
  await deployer.deploy(Bet,DAI.address,BetOracle.address);

};
