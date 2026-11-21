const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC8098 reference candidate — strict supply conformance scenarios", function () {
  let token, owner, alice, bob;
  const INITIAL = ethers.utils.parseEther("100");
  const q = (amount) => ethers.utils.parseEther(amount);

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ERC8098Reference");
    token = await Factory.deploy("Non-increasing Supply Reference", "REF8098", INITIAL, owner.address);
    await token.deployed();
  });

  async function reverts(promise) {
    let rejected = false;
    try {
      const tx = await promise;
      if (tx && tx.wait) await tx.wait();
    } catch (_) { rejected = true; }
    expect(rejected).to.equal(true);
  }

  it("allocates exactly once in the constructor, with a canonical ERC20 state", async function () {
    expect((await token.totalSupply()).eq(INITIAL)).to.equal(true);
    expect((await token.balanceOf(owner.address)).eq(INITIAL)).to.equal(true);
    expect((await token.balanceOf(alice.address)).eq(0)).to.equal(true);
    expect(await token.name()).to.equal("Non-increasing Supply Reference");
    expect(await token.symbol()).to.equal("REF8098");
  });

  it("reduces supply with owner burn and emits canonical Transfer to zero", async function () {
    const receipt = await (await token.burn(q("10"))).wait();
    const burns = receipt.events.filter(e =>
      e.event === "Transfer" && e.args.to === ethers.constants.AddressZero
    );
    expect(burns.length).to.equal(1);
    expect(burns[0].args.from).to.equal(owner.address);
    expect(burns[0].args.value.eq(q("10"))).to.equal(true);
    expect((await token.totalSupply()).eq(q("90"))).to.equal(true);
    expect((await token.balanceOf(owner.address)).eq(q("90"))).to.equal(true);
  });

  it("does not restore burned units following transfers or fresh approvals", async function () {
    await (await token.burn(q("21"))).wait();
    const afterBurn = await token.totalSupply();
    await (await token.transfer(alice.address, q("20"))).wait();
    await (await token.connect(alice).approve(bob.address, q("5"))).wait();
    await (await token.connect(bob).transferFrom(alice.address, bob.address, q("5"))).wait();
    expect((await token.totalSupply()).eq(afterBurn)).to.equal(true);
    expect((await token.totalSupply()).eq(q("79"))).to.equal(true);
  });

  it("burnFrom requires explicit allowance and reduces it on success", async function () {
    await (await token.transfer(alice.address, q("20"))).wait();
    await reverts(token.connect(bob).burnFrom(alice.address, q("4")));
    await (await token.connect(alice).approve(bob.address, q("4"))).wait();
    await (await token.connect(bob).burnFrom(alice.address, q("4"))).wait();
    expect((await token.allowance(alice.address, bob.address)).eq(0)).to.equal(true);
    expect((await token.totalSupply()).eq(q("96"))).to.equal(true);
    await reverts(token.connect(bob).burnFrom(alice.address, q("1")));
    expect((await token.totalSupply()).eq(q("96"))).to.equal(true);
  });

  it("prevents unauthorized burns, balance underflows, and burned-supply recreation", async function () {
    await reverts(token.connect(alice).burn(q("1")));
    await reverts(token.connect(alice).transfer(bob.address, q("1")));
    await reverts(token.connect(alice).burnFrom(owner.address, q("1")));
    await (await token.burn(q("100"))).wait();
    expect((await token.totalSupply()).eq(0)).to.equal(true);
    await reverts(token.transfer(alice.address, q("1")));
    await reverts(token.burn(q("1")));
    expect((await token.totalSupply()).eq(0)).to.equal(true);
  });

  it("does not expose mint, privileged supply reset, or upgrade selectors", async function () {
    const signatures = Object.keys(token.interface.functions);
    for (const name of [
      "mint", "reMint", "restoreSupply", "upgradeTo", "upgradeToAndCall",
      "setImplementation", "grantRole", "setMinter", "issue", "wrap", "unwrap"
    ]) {
      expect(signatures.some(s => s.startsWith(name + "("))).to.equal(false);
    }
    expect((await token.totalSupply()).eq(INITIAL)).to.equal(true);
  });

  it("never increases supply across a mixed multi-account trace", async function () {
    let last = await token.totalSupply();
    const steps = [
      () => token.transfer(alice.address, q("17")),
      () => token.transfer(bob.address, q("13")),
      () => token.connect(alice).approve(bob.address, q("7")),
      () => token.connect(bob).transferFrom(alice.address, bob.address, q("3")),
      () => token.connect(bob).burn(q("5")),
      () => token.burn(q("11")),
      () => token.connect(alice).burn(q("4")),
      () => token.connect(alice).transfer(owner.address, q("2")),
      () => token.connect(bob).burn(q("1"))
    ];
    for (const step of steps) {
      await (await step()).wait();
      const current = await token.totalSupply();
      expect(current.lte(last)).to.equal(true);
      last = current;
    }
    expect(last.eq(q("79"))).to.equal(true);
    const canonicalBalances = (await token.balanceOf(owner.address))
      .add(await token.balanceOf(alice.address))
      .add(await token.balanceOf(bob.address));
    expect(canonicalBalances.eq(last)).to.equal(true);
  });

  it("rejects zero-holder construction and preserves initial supply ceiling", async function () {
    const Factory = await ethers.getContractFactory("ERC8098Reference");
    await reverts(Factory.deploy("Bad", "BAD", q("1"), ethers.constants.AddressZero));
    const other = await Factory.deploy("Empty", "E0", 0, owner.address);
    await other.deployed();
    expect((await other.totalSupply()).eq(0)).to.equal(true);
    await reverts(other.connect(owner).burn(q("1")));
  });
});
