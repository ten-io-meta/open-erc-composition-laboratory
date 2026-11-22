import { resolve } from "node:path";
import type { ScientificJointContractHarnessRecipe } from "../ScientificJointContractHarness.js";
import { ERC8060_PINNED_REVISION, ERC8098_PINNED_REVISION } from "./ScientificErc8060Erc8098PinnedRecipe.js";

/**
 * Independent test-only Hardhat3/Ethers6 adapter for OECL's real native joint
 * harness executor. Never registers a candidate, admits scientific discovery,
 * or replaces the immutable Hardhat2/Ethers5 reference driver.
 *
 * The modern workspace must already contain a separately audited exact lock,
 * compiler artifacts, and byte-identical source copies from both pinned repos.
 */
export function buildErc8060Erc8098ModernPinnedRecipe(modernRoot: string): ScientificJointContractHarnessRecipe {
    const root = resolve(modernRoot);
    const driverSource = String.raw`
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const A = process.env.OECL_PARTICIPANT_A_ROOT;
const B = process.env.OECL_PARTICIPANT_B_ROOT;
const root = process.env.OECL_MODERN_JOINT_RUNTIME_ROOT;
const shaA = "c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const shaB = "68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const read = p=>fs.readFileSync(p);
const sha = p=>crypto.createHash("sha256").update(read(p)).digest("hex");
const rev = p=>execFileSync("git",["-C",p,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
if(!A||!B||!root)throw Error("Exact participant roots and modern workspace required");
if(rev(A)!==shaA||rev(B)!==shaB)throw Error("Pinned participant revisions changed");
if(sha(path.join(A,"contracts/ERC8060Reference.sol"))!==sha(path.join(root,"contracts/ERC8060Reference.sol")) ||
   sha(path.join(B,"contracts/ERC8098Reference.sol"))!==sha(path.join(root,"contracts/ERC8098Reference.sol")))
   throw Error("Modern compiled participant sources do not match exact immutable checkouts");
const deps = JSON.parse(read(path.join(root,"package-lock.json")));
if(deps.packages?.["node_modules/hardhat"]?.version!=="3.22.0" ||
   deps.packages?.["node_modules/ethers"]?.version!=="6.17.0" ||
   deps.packages?.["node_modules/zod"]?.version!=="4.6.6")
   throw Error("Modern locked toolchain identity is unverified");
if(!fs.existsSync(path.join(root,"node_modules/.bin/hardhat")))
  throw Error("Modern audited runner has not been prepared");
const evidenceFile = path.join(root,"reports","modern-smoke.json");
fs.rmSync(evidenceFile,{force:true});
const output = execFileSync(process.execPath,[path.join(root,"scripts/modern-smoke.mjs")],{
  cwd:root,encoding:"utf8",maxBuffer:8*1024*1024
});
if(!output.includes("OECL_MODERN_LOCAL_SMOKE_PASS:"))
   throw Error("Modern standalone EVM experiment did not execute");
const e = JSON.parse(read(evidenceFile));
if(e.scope!=="HARDHAT3_ETHERS6_NEW_LOCAL_SMOKE_NOT_COMPARABLE_HISTORIC_RECEIPT" ||
   e.chainId!==31337 || e.scientificVerdict!=="INCONCLUSIVE" ||
   e.candidateAdmission!=="NOT_ADMITTED" ||
   e.participants?.[0]!=="ten-io-meta/erc8060-native-eth-value@"+shaA ||
   e.participants?.[1]!=="ten-io-meta/erc8098-reference@"+shaB)
   throw Error("Modern transaction evidence does not match pinned participant scope");
if(!/^0x[0-9a-f]{64}$/i.test(e.receiptHash) ||
   !/^0x[0-9a-f]{40}$/i.test(e.contracts?.nft||"") ||
   !/^0x[0-9a-f]{40}$/i.test(e.contracts?.monotoneSupply||"") ||
   e.observations?.sameTransactionContainsBothBurns!==true ||
   e.observations.nftBurnEvents!==1 || e.observations.erc20BurnEvents!==1 ||
   e.observations.nftSolventAfter!==true ||
   BigInt(e.observations.ethRedeemed)!==100000000000000000n ||
   BigInt(e.observations.alicePayoutNetOfGas)!==BigInt(e.observations.ethRedeemed) ||
   BigInt(e.observations.supplyDecrease)!==1000000000000000000n ||
   BigInt(e.observations.erc20SupplyBefore)-BigInt(e.observations.erc20SupplyAfter)!==BigInt(e.observations.supplyDecrease))
   throw Error("Modern bilateral transaction invariants not observed");
const h=e.receiptHash;
const result={
  executionKind:"LOCAL_EVM_TWO_PINNED_REFERENCE_CONTRACTS_MODERN_HARDHAT3",
  chainId:31337,sharedRuntime:true,
  participantA:{executed:true,contractAddresses:[e.contracts.nft],transactionHashes:[h]},
  participantB:{executed:true,contractAddresses:[e.contracts.monotoneSupply],transactionHashes:[h]},
  observations:[
    "ERC8060_NFT_BURN:"+h,
    "ERC8098_SUPPLY_BURN:"+h,
    "ERC8060_ETH_PAYOUT_WEI:"+e.observations.ethRedeemed,
    "ERC8098_SUPPLY_DELTA:"+e.observations.supplyDecrease,
    "JOINT_EVM_RECEIPT_STATUS:"+e.observations.receiptStatus
  ],
  constraintObservations:[],crossProtocolInteractionObservations:[],
  scientificPolarity:"NEUTRAL",
  conclusion:"Modern joint EVM transaction verified on source-pinned participants; no emergent candidate admitted."
};
process.stdout.write("OECL_JOINT_EXECUTION_RESULT="+JSON.stringify(result)+"\n");
`;
    return {
        recipeId: "RECIPE-PINNED-ERC8060-ERC8098-MODERN-HARDHAT3-EVM-RESEARCH",
        preparationSteps: [],
        driver: {
            participantSide: "A",
            fileName: "oecl-pinned-8060-8098-modern-driver.cjs",
            source: driverSource,
            env: { OECL_MODERN_JOINT_RUNTIME_ROOT: root }
        }
    };
}
