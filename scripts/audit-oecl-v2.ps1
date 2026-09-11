$ErrorActionPreference = "Stop"

$root = Resolve-Path "."
$outputDir = Join-Path $root "architecture-audit-results"
$outputFile = Join-Path $outputDir "OECL-V2-ARCHITECTURE-AUDIT.txt"

New-Item `
    -ItemType Directory `
    -Path $outputDir `
    -Force |
    Out-Null

"OECL V2 ARCHITECTURE AUDIT" |
    Set-Content $outputFile

"Generated: $(Get-Date -Format o)" |
    Add-Content $outputFile

"Root: $root" |
    Add-Content $outputFile


function Add-Section {

    param(
        [string]$Title
    )

    Add-Content $outputFile ""
    Add-Content $outputFile "============================================================"
    Add-Content $outputFile $Title
    Add-Content $outputFile "============================================================"
    Add-Content $outputFile ""

}


# ============================================================
# 1. GLOBAL FILE STATISTICS
# ============================================================

Add-Section "1. GLOBAL FILE STATISTICS"

$allFiles =
    Get-ChildItem `
        -Path $root `
        -Recurse `
        -File `
        -ErrorAction SilentlyContinue |
    Where-Object {

        $_.FullName -notmatch "\\node_modules\\" -and
        $_.FullName -notmatch "\\\.git\\"

    }

$allDirectories =
    Get-ChildItem `
        -Path $root `
        -Recurse `
        -Directory `
        -ErrorAction SilentlyContinue |
    Where-Object {

        $_.FullName -notmatch "\\node_modules\\" -and
        $_.FullName -notmatch "\\\.git\\"

    }

$typescriptFiles =
    $allFiles |
    Where-Object {
        $_.Extension -eq ".ts"
    }

$jsonFiles =
    $allFiles |
    Where-Object {
        $_.Extension -eq ".json"
    }

"Total files: $($allFiles.Count)" |
    Add-Content $outputFile

"Total directories: $($allDirectories.Count)" |
    Add-Content $outputFile

"TypeScript files: $($typescriptFiles.Count)" |
    Add-Content $outputFile

"JSON files: $($jsonFiles.Count)" |
    Add-Content $outputFile


# ============================================================
# 2. TOP-LEVEL STRUCTURE
# ============================================================

Add-Section "2. TOP-LEVEL STRUCTURE"

Get-ChildItem `
    -Path $root |
Sort-Object Name |
ForEach-Object {

    if ($_.PSIsContainer) {

        "[DIR]  $($_.Name)"

    } else {

        "[FILE] $($_.Name)"

    }

} |
Add-Content $outputFile


# ============================================================
# 3. LABORATORY DIRECTORIES
# ============================================================

Add-Section "3. LABORATORY DIRECTORIES"

$laboratoryPath =
    Join-Path $root "laboratory"

if (
    Test-Path $laboratoryPath
) {

    Get-ChildItem `
        -Path $laboratoryPath `
        -Directory |
    Sort-Object Name |
    ForEach-Object {

        $_.Name

    } |
    Add-Content $outputFile

} else {

    "LABORATORY DIRECTORY NOT FOUND" |
        Add-Content $outputFile

}


# ============================================================
# 4. ENGINE INVENTORY
# ============================================================

Add-Section "4. ENGINE INVENTORY"

$engineFiles =
    $typescriptFiles |
    Where-Object {

        $_.Name -match "Engine\.ts$"

    } |
    Sort-Object FullName

"Engine files found: $($engineFiles.Count)" |
    Add-Content $outputFile

Add-Content $outputFile ""

foreach (
    $file in $engineFiles
) {

    $relative =
        $file.FullName.Replace(
            "$root\",
            ""
        )

    $relative |
        Add-Content $outputFile

}


# ============================================================
# 5. PIPELINE INVENTORY
# ============================================================

Add-Section "5. PIPELINE INVENTORY"

$pipelineFiles =
    $typescriptFiles |
    Where-Object {

        $_.Name -match "Pipeline\.ts$"

    } |
    Sort-Object FullName

"Pipeline files found: $($pipelineFiles.Count)" |
    Add-Content $outputFile

Add-Content $outputFile ""

foreach (
    $file in $pipelineFiles
) {

    $relative =
        $file.FullName.Replace(
            "$root\",
            ""
        )

    $relative |
        Add-Content $outputFile

}


# ============================================================
# 6. ADAPTER INVENTORY
# ============================================================

Add-Section "6. ADAPTER INVENTORY"

$adapterFiles =
    $typescriptFiles |
    Where-Object {

        $_.Name -match "Adapter\.ts$"

    } |
    Sort-Object FullName

"Adapter files found: $($adapterFiles.Count)" |
    Add-Content $outputFile

Add-Content $outputFile ""

foreach (
    $file in $adapterFiles
) {

    $relative =
        $file.FullName.Replace(
            "$root\",
            ""
        )

    $relative |
        Add-Content $outputFile

}


# ============================================================
# 7. RESULT TYPE INVENTORY
# ============================================================

Add-Section "7. RESULT TYPE INVENTORY"

$resultFiles =
    $typescriptFiles |
    Where-Object {

        $_.Name -match "Result\.ts$"

    } |
    Sort-Object FullName

"Result type files found: $($resultFiles.Count)" |
    Add-Content $outputFile

Add-Content $outputFile ""

foreach (
    $file in $resultFiles
) {

    $relative =
        $file.FullName.Replace(
            "$root\",
            ""
        )

    $relative |
        Add-Content $outputFile

}


# ============================================================
# 8. RESULT DIRECTORIES
# ============================================================

Add-Section "8. RESULT DIRECTORIES"

$resultDirectories =
    Get-ChildItem `
        -Path $root `
        -Directory |
    Where-Object {

        $_.Name -match "results$"

    } |
    Sort-Object Name

"Result directories found: $($resultDirectories.Count)" |
    Add-Content $outputFile

Add-Content $outputFile ""

foreach (
    $directory in $resultDirectories
) {

    $jsonCount =
        (
            Get-ChildItem `
                -Path $directory.FullName `
                -Filter "*.json" `
                -File `
                -ErrorAction SilentlyContinue
        ).Count

    "$($directory.Name) | JSON files: $jsonCount" |
        Add-Content $outputFile

}


# ============================================================
# 9. SCIENTIFIC PIPELINE REFERENCES
# ============================================================

Add-Section "9. SCIENTIFIC PIPELINE REFERENCES"

$scientificPipeline =
    Join-Path `
        $root `
        "laboratory\orchestration\scientific-pipeline\ScientificPipeline.ts"

if (
    Test-Path $scientificPipeline
) {

    Get-Content $scientificPipeline |
        Add-Content $outputFile

} else {

    "ScientificPipeline.ts NOT FOUND" |
        Add-Content $outputFile

}


# ============================================================
# 10. SCIENTIFIC PIPELINE RESULT CONTRACT
# ============================================================

Add-Section "10. SCIENTIFIC PIPELINE RESULT CONTRACT"

$scientificPipelineResult =
    Join-Path `
        $root `
        "laboratory\orchestration\scientific-pipeline\ScientificPipelineResult.ts"

if (
    Test-Path $scientificPipelineResult
) {

    Get-Content $scientificPipelineResult |
        Add-Content $outputFile

} else {

    "ScientificPipelineResult.ts NOT FOUND" |
        Add-Content $outputFile

}


# ============================================================
# 11. MAIN V2 ORCHESTRATOR REFERENCES
# ============================================================

Add-Section "11. MAIN V2 ORCHESTRATOR REFERENCES"

$mainV2 =
    Join-Path `
        $root `
        "scripts\run-oecl-v2.ts"

if (
    Test-Path $mainV2
) {

    Get-Content $mainV2 |
        Add-Content $outputFile

} else {

    "run-oecl-v2.ts NOT FOUND" |
        Add-Content $outputFile

}


# ============================================================
# 12. PACKAGE SCRIPTS
# ============================================================

Add-Section "12. PACKAGE SCRIPTS"

$packageJson =
    Join-Path $root "package.json"

if (
    Test-Path $packageJson
) {

    Get-Content $packageJson |
        Add-Content $outputFile

} else {

    "package.json NOT FOUND" |
        Add-Content $outputFile

}


# ============================================================
# 13. ENGINE REFERENCE COUNTS
# ============================================================

Add-Section "13. ENGINE REFERENCE COUNTS"

foreach (
    $engineFile in $engineFiles
) {

    $engineName =
        [System.IO.Path]::GetFileNameWithoutExtension(
            $engineFile.Name
        )

    $matches =
        Get-ChildItem `
            -Path $root `
            -Recurse `
            -Filter "*.ts" `
            -File `
            -ErrorAction SilentlyContinue |
        Where-Object {

            $_.FullName -notmatch "\\node_modules\\"

        } |
        Select-String `
            -Pattern $engineName `
            -SimpleMatch `
            -ErrorAction SilentlyContinue

    $externalReferences =
        $matches |
        Where-Object {

            $_.Path -ne
            $engineFile.FullName

        }

    "$engineName | references outside own file: $($externalReferences.Count)" |
        Add-Content $outputFile

}


# ============================================================
# 14. POSSIBLE ORPHAN ENGINES
# ============================================================

Add-Section "14. POSSIBLE ORPHAN ENGINES"

$orphanCount = 0

foreach (
    $engineFile in $engineFiles
) {

    $engineName =
        [System.IO.Path]::GetFileNameWithoutExtension(
            $engineFile.Name
        )

    $matches =
        Get-ChildItem `
            -Path $root `
            -Recurse `
            -Filter "*.ts" `
            -File `
            -ErrorAction SilentlyContinue |
        Where-Object {

            $_.FullName -notmatch "\\node_modules\\" -and
            $_.FullName -ne $engineFile.FullName

        } |
        Select-String `
            -Pattern $engineName `
            -SimpleMatch `
            -ErrorAction SilentlyContinue

    if (
        $matches.Count -eq 0
    ) {

        $orphanCount++

        $engineFile.FullName.Replace(
            "$root\",
            ""
        ) |
        Add-Content $outputFile

    }

}

if (
    $orphanCount -eq 0
) {

    "No obvious orphan engines detected." |
        Add-Content $outputFile

}


# ============================================================
# 15. AUDIT SUMMARY
# ============================================================

Add-Section "15. AUDIT SUMMARY"

"Files: $($allFiles.Count)" |
    Add-Content $outputFile

"Directories: $($allDirectories.Count)" |
    Add-Content $outputFile

"TypeScript files: $($typescriptFiles.Count)" |
    Add-Content $outputFile

"Engines: $($engineFiles.Count)" |
    Add-Content $outputFile

"Pipelines: $($pipelineFiles.Count)" |
    Add-Content $outputFile

"Adapters: $($adapterFiles.Count)" |
    Add-Content $outputFile

"Result types: $($resultFiles.Count)" |
    Add-Content $outputFile

"Result directories: $($resultDirectories.Count)" |
    Add-Content $outputFile

"Possible orphan engines: $orphanCount" |
    Add-Content $outputFile


Write-Host ""
Write-Host "===================================="
Write-Host "OECL V2 Architecture Audit"
Write-Host "===================================="
Write-Host ""
Write-Host "Files:" $allFiles.Count
Write-Host "Directories:" $allDirectories.Count
Write-Host "TypeScript files:" $typescriptFiles.Count
Write-Host "Engines:" $engineFiles.Count
Write-Host "Pipelines:" $pipelineFiles.Count
Write-Host "Adapters:" $adapterFiles.Count
Write-Host "Result types:" $resultFiles.Count
Write-Host "Result directories:" $resultDirectories.Count
Write-Host "Possible orphan engines:" $orphanCount
Write-Host ""
Write-Host "Audit exported:"
Write-Host $outputFile
Write-Host ""