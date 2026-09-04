$ErrorActionPreference = "Stop"

$root =
    Resolve-Path "."

$outputFile =
    ".\architecture-audit-results\OECL-V2-RESULT-ARTIFACT-AUDIT.txt"

$mainScript =
    ".\scripts\run-oecl-v2.ts"


"OECL V2 - RESULT ARTIFACT AUDIT" |
    Set-Content $outputFile


# ============================================================
# 1. FIND RESULT DIRECTORIES
# ============================================================

$resultDirectories =
    Get-ChildItem `
        -Path . `
        -Directory |
    Where-Object {
        $_.Name -match "results$"
    } |
    Sort-Object Name


# ============================================================
# 2. READ MAIN V2 ORCHESTRATOR
# ============================================================

if (
    -not (
        Test-Path $mainScript
    )
) {

    throw "run-oecl-v2.ts not found."

}

$mainContent =
    Get-Content `
        $mainScript `
        -Raw


# ============================================================
# 3. AUDIT EACH RESULT DIRECTORY
# ============================================================

$active = 0
$inactive = 0
$empty = 0

foreach (
    $directory in $resultDirectories
) {

    $directoryName =
        $directory.Name

    $referencePattern =
        "./$directoryName"

    $isReferenced =
        $mainContent.Contains(
            $referencePattern
        )

    $jsonFiles =
        Get-ChildItem `
            -Path $directory.FullName `
            -Filter "*.json" `
            -File `
            -ErrorAction SilentlyContinue

    $jsonCount =
        $jsonFiles.Count

    if ($isReferenced) {
        $active++
    } else {
        $inactive++
    }

    if ($jsonCount -eq 0) {
        $empty++
    }

    Add-Content $outputFile ""
    Add-Content $outputFile "============================================================"
    Add-Content $outputFile "DIRECTORY: $directoryName"
    Add-Content $outputFile "REFERENCED BY RUN-OECL-V2: $isReferenced"
    Add-Content $outputFile "JSON FILES: $jsonCount"

    foreach (
        $jsonFile in $jsonFiles
    ) {

        Add-Content `
            $outputFile `
            "  -> $($jsonFile.Name)"

    }

}


# ============================================================
# 4. SUMMARY
# ============================================================

Add-Content $outputFile ""
Add-Content $outputFile "============================================================"
Add-Content $outputFile "AUDIT SUMMARY"
Add-Content $outputFile "============================================================"
Add-Content $outputFile ""

Add-Content `
    $outputFile `
    "RESULT DIRECTORIES: $($resultDirectories.Count)"

Add-Content `
    $outputFile `
    "REFERENCED BY RUN-OECL-V2: $active"

Add-Content `
    $outputFile `
    "NOT REFERENCED BY RUN-OECL-V2: $inactive"

Add-Content `
    $outputFile `
    "EMPTY RESULT DIRECTORIES: $empty"


Write-Host ""
Write-Host "===================================="
Write-Host "OECL V2 RESULT ARTIFACT AUDIT"
Write-Host "===================================="
Write-Host ""
Write-Host "Result directories:" $resultDirectories.Count
Write-Host "Referenced by run-oecl-v2:" $active
Write-Host "Not referenced by run-oecl-v2:" $inactive
Write-Host "Empty result directories:" $empty
Write-Host ""
Write-Host "Audit created:"
Write-Host $outputFile
Write-Host ""