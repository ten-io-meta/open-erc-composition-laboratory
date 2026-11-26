import type { ScientificQualityContract } from "./oeclScientificQualityContract";
import type { ScientificQualityReview } from "./oeclScientificQualityReviewer";
import type { DocumentaryPair } from "./oeclErcDocumentaryDiscovery";
import type { ScientificDossier } from "./oeclScientificDossier";
import { issueScientificClaimLedger } from "./oeclScientificClaimLedger";
import { independentlyReviewScientificClaims } from "./oeclScientificClaimReviewer";

/** Gate claim issuance on the independent quality review already performed. */
export function reviewedScientificClaimLedger(
  quality:ScientificQualityContract,
  priorReview:ScientificQualityReview,
  report:DocumentaryPair|ScientificDossier,
){
  if(priorReview.accepted!==true||
     priorReview.independentEvmReplay!==false||
     priorReview.reviewedContractSha256!==quality.integrity.sha256)
    throw Error("UNVERIFIED_QUALITY_PARENT_BLOCKS_CLAIM_LEDGER");
  const claimLedger=issueScientificClaimLedger(quality,report);
  const independentClaimReview=independentlyReviewScientificClaims(
    claimLedger,quality,report);
  if(!independentClaimReview.accepted||
     independentClaimReview.checkedLedgerSha256!==claimLedger.integrity.sha256)
    throw Error("SCIENTIFIC_CLAIM_LEDGER_REJECTED");
  return {claimLedger,independentClaimReview};
}
