import pinned from "@/data/oeclErc4626EvmEvidence.json";

const RUN_ID = 45212718140;
const WORKFLOW_SHA = "f0c0b28eb66e9b935f36d2454aa053e3ef1dc322";
const SOURCE_SHA = "2d95b37480c2a458e95045ddd7d69efc30452c7b2e470de8c264df14149ec674";
const positiveNames = [
  "mint trusted research underlying",
  "approve vault asset spending",
  "deposit underlying through ERC4626",
  "redeem some shares for underlying",
  "transfer underlying to independent account",
  "approve vault from independent account",
  "independent account deposits underlying",
];
const negativeNames = [
  "attacker cannot withdraw owner's shares",
  "attacker cannot deposit without underlying or approval",
  "withdraw above owner's share balance",
];
function invalid(reason:string):never { throw Error("PINNED_ERC4626_EVM_VERIFICATION_FAILED:"+reason); }

/** CI-origin local EVM results only. Never treat a workflow success as scientific admission. */
export function getVerifiedErc4626LocalEvm() {
  const r=pinned.experiment;
  if(pinned.schemaVersion!=="OECL_PINNED_ERC4626_EVM_EVIDENCE_V1"||
     pinned.runId!==RUN_ID||pinned.workflowSha!==WORKFLOW_SHA||
     r.schemaVersion!=="OECL_ERC4626_ERC20_LOCAL_EVM_RECEIPTS_V1"||
     r.scope!=="OZ_4_9_6_ERC4626_ERC20_ISOLATED_FIXTURE_ONLY"||
     r.selected.length!==2||r.selected[0]!=="ERC-4626"||r.selected[1]!=="ERC-20"||
     r.scientificVerdict!=="INCONCLUSIVE"||r.candidateAdmission!=="NOT_ADMITTED"||
     r.evmExecuted!==true||r.localChainId!==31337||
     r.sourceSha256!==SOURCE_SHA||r.lockedDependency.package!=="@openzeppelin/contracts"||
     r.lockedDependency.version!=="4.9.6"||
     !r.lockedDependency.integrity.startsWith("sha512-")||
     !r.compilerVersion.startsWith("0.8.26+"))invalid("PROVENANCE");
  if(r.minedReceipts.length!==7||r.readOnlyNegativeControls.length!==3)
    invalid("RECEIPT_COUNT");
  const seen=new Set<string>();
  for(let i=0;i<r.minedReceipts.length;i++){
    const x=r.minedReceipts[i];
    if(x.name!==positiveNames[i]||x.status!==1||
       !/^0x[0-9a-f]{64}$/.test(x.txHash)||seen.has(x.txHash)||
       !Number.isSafeInteger(x.blockNumber)||x.blockNumber<1||
       !/^[1-9][0-9]*$/.test(x.gasUsed))
      invalid("MINED_TX_RECEIPT");
    seen.add(x.txHash);
  }
  for(let i=0;i<r.readOnlyNegativeControls.length;i++){
    const x=r.readOnlyNegativeControls[i];
    if(x.name!==negativeNames[i]||x.execution!=="EVM_CALL_STATIC_REVERT"||
       x.transactionMined!==false||x.statePreserved!==true)
      invalid("NEGATIVE_CALL_STATIC_SCOPE");
  }
  const o=r.observations;
  try{
    const unit=10n**18n;
    const dep=100n*unit;
    const remain=60n*unit;
    const final=70n*unit;
    const a=o.afterDeposit, b=o.afterAllOperations;
    if(BigInt(o.initialDeposit)!==dep||BigInt(o.initialShares)!==dep||
       BigInt(o.redeemedAssets)!==40n*unit||
       BigInt(o.independentDeposit)!==10n*unit||o.assetDecimals!==18||
       BigInt(a.assetsInVault)!==dep||BigInt(a.sharesOwner)!==dep||
       BigInt(a.vaultShareSupply)!==dep||
       BigInt(b.assetsInVault)!==final||BigInt(b.vaultShareSupply)!==final||
       BigInt(b.sharesOwner)!==remain||BigInt(b.sharesAttacker)!==10n*unit)
      invalid("ASSET_SHARE_ACCOUNTING");
  }catch{invalid("AMOUNT_FORMAT");}
  if(r.limitations.length<4||
     !r.limitations.some(x=>x.includes("not mined transaction receipts")))
    invalid("SCOPE_LIMITATIONS");
  return { ...pinned,
    provenanceUrl:"https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/"+RUN_ID,
  };
}
export type VerifiedErc4626LocalEvm = ReturnType<typeof getVerifiedErc4626LocalEvm>;
