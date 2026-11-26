import type { ScientificQualityContract } from "./oeclScientificQualityContract";
import type { ScientificQualityReview } from "./oeclScientificQualityReviewer";
import type { ScientificClaimLedger } from "./oeclScientificClaimLedger";
import type { ScientificClaimReview } from "./oeclScientificClaimReviewer";
import { issueReproducedVaultAddendum } from "./oeclReproducedVaultAddendum";
import { independentlyReviewReproducedVault } from "./oeclReproducedVaultReviewer";

/** The archived cross-implementation result is only an ADDENDUM.
 * Source-only ERC documentary conclusions remain completely unchanged.
 */
export function reviewedReproducedVaultAddendum(
 quality:ScientificQualityContract,
 review:ScientificQualityReview,
 ledger:ScientificClaimLedger,
 claimReview:ScientificClaimReview,
){
 if(review.accepted!==true||review.independentEvmReplay!==false||
    review.reviewedContractSha256!==quality.integrity.sha256||
    claimReview.accepted!==true||
    claimReview.checkedLedgerSha256!==ledger.integrity.sha256||
    ledger.qualityContractSha256!==quality.integrity.sha256)
  throw Error("REPRODUCTION_QUALITY_PARENT_REVIEW_MISSING");
 const reproductionAddendum=issueReproducedVaultAddendum(quality,ledger);
 const independentReproductionReview=independentlyReviewReproducedVault(
  reproductionAddendum,quality,ledger);
 if(!independentReproductionReview.accepted||
    independentReproductionReview.reviewedAddendumSha256!==
      reproductionAddendum.integrity.sha256){
  throw Error("INDEPENDENT_REPRODUCED_CASE_REVIEW_FAILED");
 }
 return {reproductionAddendum,independentReproductionReview};
}
