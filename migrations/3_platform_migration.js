const platform = artifacts.require('Platform');

module.exports = function (deployer) {
  deployer.deploy(platform);
};
