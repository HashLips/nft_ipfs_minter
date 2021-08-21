const { assert } = require("chai");

const SmartContract = artifacts.require("./SmartContract.sol");

require("chai").use(require("chai-as-promised")).should();

contract("SmartContract", (accounts) => {
  let smartContract;

  before(async () => {
    smartContract = await SmartContract.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = await smartContract.address;
      assert.notEqual(address, "");
      assert.notEqual(address, 0x0);
    });
  });

  describe("minting", async () => {
    it("minted successfully", async () => {
      const uri = "https://example.com";
      await smartContract.mint(accounts[0], uri);
      const tokenUri = await smartContract.tokenURI(0);
      const balanceOfOwner = await smartContract.balanceOf(accounts[0]);
      assert.equal(tokenUri, uri);
      assert.equal(balanceOfOwner, 1);
    });
  });
});
