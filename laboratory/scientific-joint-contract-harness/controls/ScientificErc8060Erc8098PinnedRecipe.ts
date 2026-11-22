import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import type { ScientificJointContractHarnessRecipe } from "../ScientificJointContractHarness.js";

export const ERC8060_PINNED_REPOSITORY = "ten-io-meta/erc8060-native-eth-value";
export const ERC8098_PINNED_REPOSITORY = "ten-io-meta/erc8098-reference";
export const ERC8060_PINNED_REVISION = "c7eed906835ab39fbc8439eb0493e5a5371b23a2";
export const ERC8098_PINNED_REVISION = "68a05289bd68d89db8453c49500e0a1ae6cd11ec";

/** A pinned, isolated bilateral EVM recipe. Never manufactures constraint observations. */
export function buildErc8060Erc8098PinnedRecipe(): ScientificJointContractHarnessRecipe {
    const here = dirname(fileURLToPath(import.meta.url));
    const integration = resolve(here, "../../../integrations/erc8060-erc8098");
    const coordinator = readFileSync(resolve(integration, "solidity/OECLJointRedemption.sol"), "utf8");
    const test = readFileSync(resolve(integration, "test/OECLPinnedReferences.test.js"), "utf8");
    const driverSource = `
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFileSync } = require("node:child_process");
const a = process.env.OECL_PARTICIPANT_A_ROOT;
const b = process.env.OECL_PARTICIPANT_B_ROOT;
if (!a || !b) throw new Error("Both exact participant roots required");
const SHA_A = ${JSON.stringify(ERC8060_PINNED_REVISION)};
const SHA_B = ${JSON.stringify(ERC8098_PINNED_REVISION)};
const gitRev = dir => execFileSync("git", ["-C",dir,"rev-parse","HEAD"], {encoding:"utf8"}).trim();
if (gitRev(a) !== SHA_A || gitRev(b) !== SHA_B) throw new Error("Pinned participant Git revision mismatch");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oecl-8060-8098-native-"));
try {
  for (const name of ["package.json", "package-lock.json", "hardhat.config.js"])
    fs.copyFileSync(path.join(a,name), path.join(dir,name));
  fs.mkdirSync(path.join(dir,"contracts"));
  fs.mkdirSync(path.join(dir,"test"));
  fs.copyFileSync(path.join(a,"contracts/ERC8060Reference.sol"),path.join(dir,"contracts/ERC8060Reference.sol"));
  fs.copyFileSync(path.join(b,"contracts/ERC8098Reference.sol"),path.join(dir,"contracts/ERC8098Reference.sol"));
  fs.writeFileSync(path.join(dir,"contracts/OECLJointRedemption.sol"), ${JSON.stringify(coordinator)});
  fs.writeFileSync(path.join(dir,"test/OECLPinnedReferences.test.js"), ${JSON.stringify(test)});
  const installed = path.join(a, "node_modules");
  if (!fs.existsSync(installed)) throw new Error("Pinned ERC8060 environment missing npm ci preparation");
  fs.symlinkSync(installed,path.join(dir,"node_modules"),"dir");
  const evidenceFile = path.join(dir, "joint-evidence.json");
  const output = execFileSync(path.join(a,"node_modules/.bin/hardhat"),
    ["test","test/OECLPinnedReferences.test.js"], {
       cwd: dir, encoding:"utf8", maxBuffer:16*1024*1024,
       env: {...process.env,OECL_JOINT_EVIDENCE_PATH:evidenceFile}
    });
  if (!/3 passing/.test(output)) throw new Error("Full joint regression did not pass");
  const e = JSON.parse(fs.readFileSync(evidenceFile,"utf8"));
  if(e.erc8060PinnedRevision !== SHA_A || e.erc8098PinnedRevision !== SHA_B ||
     e.observations.sameTransactionContainsBothBurns !== true ||
     e.observations.nftSolventAfter !== true) throw new Error("Joint evidence does not match pinned sources");
  if(BigInt(e.observations.alicePayoutNetOfGas)!==BigInt(e.observations.ethRedeemed) ||
     BigInt(e.observations.erc20SupplyAfter)>=BigInt(e.observations.erc20SupplyBefore))
       throw new Error("Joint ETH or supply invariants did not hold");
  const h=e.transactions.jointRedemption;
  const result = {
     executionKind:"LOCAL_EVM_TWO_PINNED_REFERENCE_CONTRACTS",
     chainId:e.chainId, sharedRuntime:true,
     participantA:{executed:true, contractAddresses:[e.contracts.nft], transactionHashes:[h]},
     participantB:{executed:true, contractAddresses:[e.contracts.monotoneSupply], transactionHashes:[h]},
     observations:[
       "ERC8060_NFT_BURN:" + h,
       "ERC8098_SUPPLY_BURN:" + h,
       "ERC8060_ETH_PAYOUT_WEI:" + e.observations.ethRedeemed,
       "ERC8098_SUPPLY_DELTA:" + e.observations.supplyDecrease,
       "JOINT_EVM_RECEIPT_BLOCK:" + e.observations.jointReceiptBlockNumber
     ],
     constraintObservations:[],
     crossProtocolInteractionObservations:[],
     scientificPolarity:"NEUTRAL",
     conclusion:"Operational pinned 8060 x 8098 transaction verified; no source-constraint-specific observation was admitted."
  };
  process.stdout.write("OECL_JOINT_EXECUTION_RESULT=" + JSON.stringify(result) + "\\n");
} finally {
  fs.rmSync(dir,{recursive:true,force:true});
}
`;
    return {
        recipeId: "RECIPE-PINNED-ERC8060-ERC8098-LOCAL-EVM",
        // CI may prepare the audited, exact-lock EVM tooling in an isolated workspace.
        // All other callers retain the historical pinned npm ci recipe unchanged.
        // This is only an operational test-recipe switch, never scientific admission.
        preparationSteps: process.env.OECL_AUDITED_EVM_TOOLCHAIN_READY === "1"
            ? []
            : [
                {stepId:"INSTALL-PINNED-8060-TOOLCHAIN",participantSide:"A",command:"npm",args:["ci"]}
            ],
        driver:{participantSide:"A",fileName:"oecl-pinned-8060-8098-driver.cjs",source:driverSource}
    };
}
