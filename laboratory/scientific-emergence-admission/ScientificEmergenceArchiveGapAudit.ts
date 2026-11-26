/**
 * OECLS-0011: read-only gap audit of already published local-EVM snapshots.
 *
 * Source of trust: SHA-256 pins for the *repository's archived JSON projection*.
 * This verifies snapshot identity, NOT original receipts, authorship,
 * independent experiment replication, or causal emergence.
 *
 * Existing OECL scientific verdicts MUST remain unchanged.
 */
import { createHash } from "node:crypto";

export type ArchivedCaseId =
    "ERC-8060_X_ERC-8098" |
    "ERC-8060_X_ERC-20-BURNABLE" |
    "ERC-4626_X_ERC-20";

export interface ArchiveGap {
    gate: "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7";
    status: "UNRESOLVED";
    reason: string;
}

export interface ArchivedEvidenceAssessment {
    schema: "OECLS_0011_ARCHIVED_EVM_GAP_AUDIT_V1";
    archiveId: ArchivedCaseId | null;
    archiveIntegrity: "PINNED_SNAPSHOT_MATCH" | "NOT_ESTABLISHED";
    observedEvidenceTier:
        "ARCHIVED_SCOPED_LOCAL_EVM_REPORT" | "NONE";
    status:
        "ARCHIVED_LOCAL_EFFECT_REPORTED_NOT_EMERGENCE" | "INCONCLUSIVE";
    namedObservedEffect: string | null;
    sourceRevisions: string[];
    recordedTransactions: number;
    simulatedCalls: number;
    unresolved: ArchiveGap[];
    errors: string[];
    canAnnounceEmergence: false;
    independentReceiptReplayPerformed: false;
    causalEmergenceEstablished: false;
    machineDiscoveryAuthenticated: false;
    externalSourceBytesReverified: false;
    existingVerdictsChanged: false;
}

const PINS: Record<ArchivedCaseId, string> = {
    "ERC-8060_X_ERC-8098":
        "9cfb5bbd4bf0b98a424827a13057507d5ef3f3ea3e30e256eb9cc8cdf2ef13a6",
    "ERC-8060_X_ERC-20-BURNABLE":
        "e0ca78bf9fa95925f62a5f100b60c9ed551c26a67c7e5553986e10b006428e66",
    "ERC-4626_X_ERC-20":
        "00a255bb2e2a4be64a6676611eed7b1ba84bb3c4c4a8792cd560dc6231f478dc"
};

const REV_8060 = "c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const REV_8098 = "68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const REV_OZ = "dc44c9f1a4c3b10af99492eed84f83ed244203f6";

const GAP_REASONS: readonly ArchiveGap[] = [
    {gate: "G1", status: "UNRESOLVED",
        reason: "ARCHIVED_EFFECT_NOT_YET_REGISTERED_AS_OECLS_0011_FALSIFIABLE_PROPERTY"},
    {gate: "G2", status: "UNRESOLVED",
        reason: "MISSING_PROSPECTIVE_DISCOVERY_SEARCH_AND_CONFIRMATION_CHAIN"},
    {gate: "G3", status: "UNRESOLVED",
        reason: "NONTRIVIALITY_VERSUS_GENERIC_EVM_OR_ADAPTER_NOT_EXCLUDED"},
    {gate: "G4", status: "UNRESOLVED",
        reason: "CAUSAL_MECHANISM_NOT_ISOLATED_ACROSS_PARTICIPANTS"},
    {gate: "G5", status: "UNRESOLVED",
        reason: "MISSING_FULL_MATCHED_ISOLATED_NONINTERACTING_ABLATION_RESTORATION_COORDINATOR_CONTROLS"},
    {gate: "G6", status: "UNRESOLVED",
        reason: "ARCHIVE_HASH_IS_NOT_INDEPENDENT_EVM_RECEIPT_REPLAY_OR_CAUSAL_REPLICATION"},
    {gate: "G7", status: "UNRESOLVED",
        reason: "PRIOR_ART_NOVELTY_AND_CLAIM_SCOPE_REVIEW_NOT_DOCUMENTED_FOR_OECLS_0011"}
];

const obj = (x: unknown): x is Record<string, any> =>
    x !== null && typeof x === "object" && !Array.isArray(x);
const hex = (x: unknown) => typeof x === "string" && /^[a-f0-9]{64}$/.test(x);
const txhash = (x: unknown) => typeof x === "string" && /^0x[a-f0-9]{64}$/.test(x);
const rev = (x: unknown) => typeof x === "string" && /^[a-f0-9]{40}$/.test(x);
const positive = (x: unknown): bigint => {
    if (typeof x !== "string" || !/^(0|[1-9][0-9]*)$/.test(x))
        throw Error("INVALID_INTEGER_MEASUREMENT");
    return BigInt(x);
};
const samePair = (actual: unknown, a: string, b: string) =>
    Array.isArray(actual) && actual.length === 2 &&
    actual[0] === a && actual[1] === b;

function pinned8060And8098(data: Record<string, any>): {
    effect: string; sources: string[]; mined: number; staticCalls: number;
} {
    if (data.schemaVersion !== "OECL_USER_SCIENTIFIC_DOSSIER_V1" ||
        data.scope !== "PINNED_LOCAL_HARDHAT_EVM" ||
        data.verdict !== "INCONCLUSIVE" ||
        data.candidateAdmission !== "NOT_ADMITTED" ||
        data.universalCompatibilityEstablished !== false ||
        data.discovery?.status !== "UNEVALUATED_SOURCE_HYPOTHESIS" ||
        data.discovery?.origin !== "COMPILER_RESOLVED_SOLIDITY_AST_ONLY" ||
        data.experiment?.chainId !== 31337 ||
        data.experiment?.propertyStatus !== "OBSERVED_IN_PINNED_LOCAL_EVM" ||
        data.experiment?.bothBurnsInSameTransaction !== true ||
        !txhash(data.experiment?.transactionHash) ||
        data.scientificQuestions?.sourceCoverageComplete !== false ||
        data.scientificQuestions?.allQuestionsResolved !== false ||
        data.adversarial?.status !== "PARTIAL_COVERAGE" ||
        !Array.isArray(data.adversarial?.untested) ||
        data.adversarial.untested.length < 1 ||
        !Array.isArray(data.participants) ||
        data.participants.length !== 2 ||
        data.participants[0]?.revision !== REV_8060 ||
        data.participants[1]?.revision !== REV_8098 ||
        !hex(data.participants[0]?.sourceSha256) ||
        !hex(data.participants[1]?.sourceSha256) ||
        !Array.isArray(data.scientificQuestions?.observations) ||
        data.scientificQuestions.observations.length !==
            data.scientificQuestions.total) {
        throw Error("PINNED_8060_8098_SCOPE_OR_PROVENANCE_MISMATCH");
    }
    const e = data.experiment;
    if (positive(e.ethRedeemedWei) <= 0n ||
        positive(e.ethRedeemedWei) !== positive(e.nftObligationDecreaseWei) ||
        positive(e.supplyBeforeBaseUnits) -
            positive(e.supplyAfterBaseUnits) !==
            positive(e.supplyDecreaseBaseUnits) ||
        positive(e.supplyDecreaseBaseUnits) <= 0n)
        throw Error("PINNED_8060_8098_REPORTED_NUMERIC_CONTRADICTION");
    return {
        effect: "REPORTED_JOINT_ETH_REDEMPTION_AND_FUNGIBLE_SUPPLY_DECREASE",
        sources: [REV_8060, REV_8098],
        // The snapshot shows one named transaction, not the complete raw
        // underlying run's receipt set.
        mined: 1, staticCalls: 0
    };
}

function pinnedIndependentBurnable(data: Record<string, any>): {
    effect: string; sources: string[]; mined: number; staticCalls: number;
} {
    if (data.schemaVersion !== "OECL_INDEPENDENT_BURNABLE_WEB_V1" ||
        !samePair(data.sourcePair, "ERC-8060", "ERC-20-BURNABLE") ||
        !samePair(data.sourceRevisions, REV_8060, REV_OZ) ||
        !Array.isArray(data.sourceHashes) ||
        data.sourceHashes.length !== 2 ||
        !data.sourceHashes.every(hex) ||
        data.scientificVerdict !== "INCONCLUSIVE" ||
        data.candidateAdmission !== "NOT_ADMITTED" ||
        data.universalCompatibilityEstablished !== false ||
        data.nativeEvaluation?.finalScientificVerdict !== "INCONCLUSIVE" ||
        data.nativeEvaluation?.candidateAdmission !== "NOT_ADMITTED" ||
        data.nativeEvaluation?.nativeDiscoveryReady !== false ||
        data.nativeEvaluation?.sourceCoverageComplete !== false ||
        data.localEvm?.chainId !== 31337 ||
        data.localEvm?.sameTransactionBurns !== true ||
        data.localEvm?.negativeRollbacksVerified !== true ||
        !Array.isArray(data.cases) || data.cases.length !== 10 ||
        !Array.isArray(data.limitations) || data.limitations.length < 1) {
        throw Error("PINNED_BURNABLE_SCOPE_OR_PROVENANCE_MISMATCH");
    }
    const success = data.cases.filter((x: unknown) =>
        obj(x) && x.status === 1);
    const failures = data.cases.filter((x: unknown) =>
        obj(x) && x.status === 0 && x.rollbackObserved === true);
    if (success.length !== 3 || failures.length !== 7 ||
        data.localEvm.positiveCases !== 3 ||
        data.localEvm.negativeCases !== 7 ||
        !data.cases.every((x: unknown) => obj(x) && txhash(x.transactionHash)) ||
        !data.cases.some((x: any) =>
            x.name === "AUTHORIZED_AND_FUNDED" &&
            x.status === 1 && x.sameTransactionBurns === true &&
            positive(x.nftObligationDecreaseWei) > 0n &&
            positive(x.fungibleSupplyDecreaseUnits) > 0n))
        throw Error("PINNED_BURNABLE_REPORTED_CASE_CONTRADICTION");
    return {
        effect: "REPORTED_LOCAL_JOINT_BURNS_WITH_BOUNDED_ROLLBACK_CONTROLS",
        sources: [REV_8060, REV_OZ],
        mined: 10, staticCalls: 0
    };
}

function pinnedVault(data: Record<string, any>): {
    effect: string; sources: string[]; mined: number; staticCalls: number;
} {
    const e = data.experiment;
    if (data.schemaVersion !== "OECL_PINNED_ERC4626_EVM_EVIDENCE_V1" ||
        !obj(e) ||
        e.schemaVersion !== "OECL_ERC4626_ERC20_LOCAL_EVM_RECEIPTS_V1" ||
        !samePair(e.selected, "ERC-4626", "ERC-20") ||
        e.scientificVerdict !== "INCONCLUSIVE" ||
        e.candidateAdmission !== "NOT_ADMITTED" ||
        e.scope !== "OZ_4_9_6_ERC4626_ERC20_ISOLATED_FIXTURE_ONLY" ||
        e.evmExecuted !== true || e.localChainId !== 31337 ||
        e.lockedDependency?.package !== "@openzeppelin/contracts" ||
        e.lockedDependency?.version !== "4.9.6" ||
        !hex(e.sourceSha256) ||
        !Array.isArray(e.minedReceipts) || e.minedReceipts.length !== 7 ||
        !Array.isArray(e.readOnlyNegativeControls) ||
        e.readOnlyNegativeControls.length !== 3 ||
        !e.minedReceipts.every((r: unknown) =>
            obj(r) && r.status === 1 && txhash(r.txHash)) ||
        !e.readOnlyNegativeControls.every((r: unknown) =>
            obj(r) && r.execution === "EVM_CALL_STATIC_REVERT" &&
            r.transactionMined === false && r.statePreserved === true)) {
        throw Error("PINNED_VAULT_SCOPE_OR_PROVENANCE_MISMATCH");
    }
    const o = e.observations;
    if (!obj(o) || !obj(o.afterDeposit) || !obj(o.afterAllOperations) ||
        positive(o.initialDeposit) !== positive(o.initialShares) ||
        positive(o.initialDeposit) !==
            positive(o.afterDeposit.vaultShareSupply) ||
        positive(o.initialDeposit) -
            positive(o.redeemedAssets) +
            positive(o.independentDeposit) !==
            positive(o.afterAllOperations.vaultShareSupply) ||
        positive(o.afterAllOperations.assetsInVault) !==
            positive(o.afterAllOperations.vaultShareSupply))
        throw Error("PINNED_VAULT_REPORTED_ACCOUNTING_CONTRADICTION");
    return {
        effect: "REPORTED_LOCAL_VAULT_ASSET_SHARE_ACCOUNTING",
        sources: [e.sourceSha256], mined: 7, staticCalls: 3
    };
}

export class ScientificEmergenceArchiveGapAudit {
    assess(archiveId: ArchivedCaseId, archive: unknown): ArchivedEvidenceAssessment {
        const result: ArchivedEvidenceAssessment = {
            schema: "OECLS_0011_ARCHIVED_EVM_GAP_AUDIT_V1",
            archiveId: Object.hasOwn(PINS, archiveId) ? archiveId : null,
            archiveIntegrity: "NOT_ESTABLISHED",
            observedEvidenceTier: "NONE",
            status: "INCONCLUSIVE",
            namedObservedEffect: null,
            sourceRevisions: [],
            recordedTransactions: 0,
            simulatedCalls: 0,
            unresolved: GAP_REASONS.map(x => ({...x})),
            errors: [],
            canAnnounceEmergence: false,
            independentReceiptReplayPerformed: false,
            causalEmergenceEstablished: false,
            machineDiscoveryAuthenticated: false,
            externalSourceBytesReverified: false,
            existingVerdictsChanged: false
        };
        if (result.archiveId === null || !obj(archive)) {
            result.errors.push("UNKNOWN_CASE_OR_MALFORMED_ARCHIVE");
            return result;
        }
        try {
            const canonical = JSON.stringify(archive);
            if (Buffer.byteLength(canonical) > 65536) {
                result.errors.push("ARCHIVE_SIZE_EXCEEDED");
                return result;
            }
            const digest = createHash("sha256").update(canonical).digest("hex");
            if (digest !== PINS[archiveId]) {
                result.errors.push("ARCHIVED_SNAPSHOT_HASH_MISMATCH");
                return result;
            }
            result.archiveIntegrity = "PINNED_SNAPSHOT_MATCH";
            const scoped = archiveId === "ERC-8060_X_ERC-8098" ?
                pinned8060And8098(archive) :
                archiveId === "ERC-8060_X_ERC-20-BURNABLE" ?
                pinnedIndependentBurnable(archive) :
                pinnedVault(archive);
            result.observedEvidenceTier = "ARCHIVED_SCOPED_LOCAL_EVM_REPORT";
            result.status = "ARCHIVED_LOCAL_EFFECT_REPORTED_NOT_EMERGENCE";
            result.namedObservedEffect = scoped.effect;
            result.sourceRevisions = scoped.sources;
            result.recordedTransactions = scoped.mined;
            result.simulatedCalls = scoped.staticCalls;
        } catch (error) {
            result.errors.push(error instanceof Error ?
                error.message : "ARCHIVED_EVIDENCE_READ_FAILED");
        }
        return result;
    }
}
