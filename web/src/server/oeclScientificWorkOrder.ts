import registry from "@/data/registeredExperimentIndex.json";
import corpus from "@/data/officialErcCorpus.json";
import catalog from "@/data/scientificPairCatalog.json";

/**
 * Bridge from documentary source discovery to EXISTING OECL experimental
 * infrastructure. Never executes unreviewed code from GitHub, Magicians,
 * arbitrary ERC text or browser inputs.
 */
const profiles = new Map(corpus.profiles.map(p => [p.id,p]));
function unorderedPair(a:string,b:string,x:string,y:string) {
 return (a===x&&b===y)||(a===y&&b===x);
}
export type ScientificWorkOrder = ReturnType<typeof scientificWorkOrder>;

export function scientificWorkOrder(a:string,b:string) {
 const left=profiles.get(a),right=profiles.get(b);
 const registered=registry.registrations.find(x=>
    unorderedPair(a,b,x.participantIds[0],x.participantIds[1]));
 const knownProjection=catalog.projections.find(x=>
    unorderedPair(a,b,x.sourceParticipantId,x.targetParticipantId));
 const requires=left?.requires.includes(b)||right?.requires.includes(a)||false;
 const referenced=left?.references.includes(b)||right?.references.includes(a)||false;
 const documentarySignal=requires?"DECLARED_SOURCE_DEPENDENCY":
   referenced?"TEXTUAL_REFERENCE_ONLY":"NONE_IN_PINNED_CORPUS";
 const admissibility=registered?"PINNED_OFFLINE_RECIPE_AVAILABLE":
   "NOT_REGISTERED_FOR_EXECUTION";
 return {
  workOrderSchema:"OECL_SCIENTIFIC_CANDIDATE_WORK_ORDER_V1" as const,
  participants:[a,b],
  scientificScope:"EXACT_COMPOSITION_RUNTIME_NOT_ESTABLISHED_BY_DOCUMENTS" as const,
  documentarySignal,
  currentExperiment:{
   status:admissibility,
   registrationId:registered?.registrationId??null,
   harness:registered?.executor??"ScientificJointContractHarnessExecutor",
   executionScript:registered?.script??null,
   foundationProtocolId:registered?.foundationProtocolId??null,
   pinnedSources:registered?.pinnedSources??[],
   historicalResult:registered?.previousObservedResult??null,
   historicalScientificPolarity:registered?.scientificPolarity??null,
   nextAction:registered?"RUN_PINNED_RECIPE_IN_ISOLATED_CI":"REGISTER_EXACT_IMPLEMENTATIONS_AND_REVIEWED_RUNTIME_RECIPE"
  },
  existingScientificEvidence:knownProjection?{
   candidateId:knownProjection.candidateId,
   compatibilityPolarity:knownProjection.compatibility.polarity,
   observedBoundaries:knownProjection.boundaries.preservedRegions+knownProjection.boundaries.violatedRegions,
   unresolvedBoundaries:knownProjection.boundaries.unresolved,
   harmonyStatus:knownProjection.harmony?.status??"INCONCLUSIVE",
   compositionValueStatus:knownProjection.compositionValue?.status??"NOT_ESTABLISHED",
   basis:"FROZEN_SCIENTIFIC_PAIR_CATALOG_NOT_NEW_EXECUTION" as const
  }:null,
  requiredExperiments:[
   {id:"PINNED-JOINT",requirement:"Execute both participants in one EVM with exact source revisions and attach raw receipts"},
   {id:"STANDALONE-A",requirement:"Test property predicate with participant A alone in equivalent conditions"},
   {id:"STANDALONE-B",requirement:"Test property predicate with participant B alone in equivalent conditions"},
   {id:"ABLATION-A",requirement:"Remove A from the same joint configuration and observe loss or change of candidate property"},
   {id:"ABLATION-B",requirement:"Remove B from the same joint configuration and observe loss or change of candidate property"},
   {id:"ADVERSARIAL-BOUNDARIES",requirement:"Exercise relevant attacks, failure modes and participant-specific invariants"}
  ],
  verifiedEmergentProperties:[],
  verdict:"EXPERIMENTS_REQUIRED" as const,
  note:"A registered joint harness permits reviewed offline execution, not a positive composition verdict. Existing scientific projection is preserved without promotion. No arbitrary on-demand contract execution in public API."
 };
}
