$ErrorActionPreference = "Stop"

$root = (Resolve-Path ".").Path

$outputDirectory =
    ".\architecture-audit-results"

$outputFile =
    Join-Path `
        $outputDirectory `
        "OECL-V2-MASTER-DATA-FLOW-AUDIT.txt"

if (
    -not (
        Test-Path $outputDirectory
    )
) {

    New-Item `
        -ItemType Directory `
        -Path $outputDirectory |
        Out-Null

}

"OECL V2 - MASTER DATA FLOW AUDIT" |
    Set-Content $outputFile

Add-Content $outputFile ""
Add-Content $outputFile "Generated: $(Get-Date -Format o)"
Add-Content $outputFile ""
Add-Content $outputFile "============================================================"
Add-Content $outputFile "1. ENGINE DATA FLOW"
Add-Content $outputFile "============================================================"

$engineFiles =
    Get-ChildItem `
        -Path .\laboratory `
        -Recurse `
        -Filter "*Engine.ts" `
        -File |
    Where-Object {
        $_.FullName -notmatch "\\node_modules\\"
    }

$allTypeScriptFiles =
    Get-ChildItem `
        -Path . `
        -Recurse `
        -Filter "*.ts" `
        -File |
    Where-Object {
        $_.FullName -notmatch "\\node_modules\\"
    }

$engineSummary = @()

foreach (
    $engineFile in $engineFiles
) {

    $engineName =
        [System.IO.Path]::
        GetFileNameWithoutExtension(
            $engineFile.Name
        )

    $relativeEnginePath =
        $engineFile.FullName.Substring(
            $root.Length
        ).TrimStart(
            '\'
        )

    $references = @()

    foreach (
        $tsFile in $allTypeScriptFiles
    ) {

        if (
            $tsFile.FullName -eq
            $engineFile.FullName
        ) {

            continue

        }

        $matches =
            Select-String `
                -Path $tsFile.FullName `
                -Pattern $engineName `
                -SimpleMatch `
                -ErrorAction SilentlyContinue

        if (
            $matches
        ) {

            $references +=
                $tsFile.FullName.Substring(
                    $root.Length
                ).TrimStart(
                    '\'
                )

        }

    }

    $references =
        $references |
        Sort-Object -Unique

    $pipelineReferences =
        $references |
        Where-Object {
            $_ -match "Pipeline\.ts$"
        }

    $scriptReferences =
        $references |
        Where-Object {
            $_ -match "^scripts\\"
        }

    $engineReferences =
        $references |
        Where-Object {
            $_ -match "Engine\.ts$"
        }

    $mainReference =
        $references |
        Where-Object {
            $_ -eq "scripts\run-oecl-v2.ts"
        }

    $status =
        if (
            $references.Count -eq 0
        ) {

            "ISOLATED"

        } elseif (
            $pipelineReferences.Count -gt 0
        ) {

            "PIPELINE_CONNECTED"

        } elseif (
            $scriptReferences.Count -gt 0
        ) {

            "SCRIPT_CONNECTED"

        } elseif (
            $engineReferences.Count -gt 0
        ) {

            "ENGINE_CONNECTED"

        } else {

            "REFERENCED"

        }

    Add-Content $outputFile ""
    Add-Content $outputFile "------------------------------------------------------------"
    Add-Content $outputFile "ENGINE: $engineName"
    Add-Content $outputFile "FILE: $relativeEnginePath"
    Add-Content $outputFile "STATUS: $status"
    Add-Content $outputFile "TOTAL REFERENCES: $($references.Count)"
    Add-Content $outputFile "PIPELINE REFERENCES: $($pipelineReferences.Count)"
    Add-Content $outputFile "SCRIPT REFERENCES: $($scriptReferences.Count)"
    Add-Content $outputFile "ENGINE REFERENCES: $($engineReferences.Count)"
    Add-Content $outputFile "MAIN V2 ORCHESTRATOR: $([bool]$mainReference)"

    if (
        $references.Count -gt 0
    ) {

        Add-Content $outputFile "REFERENCED BY:"

        foreach (
            $reference in $references
        ) {

            Add-Content `
                $outputFile `
                "  - $reference"

        }

    }

    $engineSummary +=
        [PSCustomObject]@{

            Engine =
                $engineName

            File =
                $relativeEnginePath

            Status =
                $status

            References =
                $references.Count

            PipelineReferences =
                $pipelineReferences.Count

            ScriptReferences =
                $scriptReferences.Count

            EngineReferences =
                $engineReferences.Count

            MainOrchestrator =
                [bool]$mainReference

        }

}

Add-Content $outputFile ""
Add-Content $outputFile ""
Add-Content $outputFile "============================================================"
Add-Content $outputFile "2. RESULT DIRECTORY DATA FLOW"
Add-Content $outputFile "============================================================"

$resultDirectories =
    Get-ChildItem `
        -Path . `
        -Directory |
    Where-Object {
        $_.Name -match "-results$"
    }

$resultSummary = @()

foreach (
    $directory in $resultDirectories
) {

    $directoryName =
        $directory.Name

    $files =
        Get-ChildItem `
            -Path $directory.FullName `
            -Recurse `
            -File `
            -ErrorAction SilentlyContinue

    $references = @()

    foreach (
        $tsFile in $allTypeScriptFiles
    ) {

        $matches =
            Select-String `
                -Path $tsFile.FullName `
                -Pattern $directoryName `
                -SimpleMatch `
                -ErrorAction SilentlyContinue

        if (
            $matches
        ) {

            $references +=
                $tsFile.FullName.Substring(
                    $root.Length
                ).TrimStart(
                    '\'
                )

        }

    }

    $references =
        $references |
        Sort-Object -Unique

    $mainReference =
        $references |
        Where-Object {
            $_ -eq "scripts\run-oecl-v2.ts"
        }

    $status =
        if (
            $files.Count -eq 0
        ) {

            "EMPTY"

        } elseif (
            $references.Count -eq 0
        ) {

            "UNREFERENCED"

        } elseif (
            $mainReference
        ) {

            "MAIN_ORCHESTRATOR_CONNECTED"

        } else {

            "INDIRECTLY_CONNECTED"

        }

    Add-Content $outputFile ""
    Add-Content $outputFile "------------------------------------------------------------"
    Add-Content $outputFile "RESULT DIRECTORY: $directoryName"
    Add-Content $outputFile "STATUS: $status"
    Add-Content $outputFile "FILES: $($files.Count)"
    Add-Content $outputFile "TOTAL REFERENCES: $($references.Count)"
    Add-Content $outputFile "MAIN V2 ORCHESTRATOR: $([bool]$mainReference)"

    if (
        $references.Count -gt 0
    ) {

        Add-Content $outputFile "REFERENCED BY:"

        foreach (
            $reference in $references
        ) {

            Add-Content `
                $outputFile `
                "  - $reference"

        }

    }

    $resultSummary +=
        [PSCustomObject]@{

            Directory =
                $directoryName

            Status =
                $status

            Files =
                $files.Count

            References =
                $references.Count

            MainOrchestrator =
                [bool]$mainReference

        }

}

Add-Content $outputFile ""
Add-Content $outputFile ""
Add-Content $outputFile "============================================================"
Add-Content $outputFile "3. PIPELINE INVENTORY"
Add-Content $outputFile "============================================================"

$pipelineFiles =
    Get-ChildItem `
        -Path .\laboratory `
        -Recurse `
        -Filter "*Pipeline.ts" `
        -File

foreach (
    $pipeline in $pipelineFiles
) {

    $relativePipelinePath =
        $pipeline.FullName.Substring(
            $root.Length
        ).TrimStart(
            '\'
        )

    Add-Content `
        $outputFile `
        "PIPELINE: $relativePipelinePath"

}

Add-Content $outputFile ""
Add-Content $outputFile ""
Add-Content $outputFile "============================================================"
Add-Content $outputFile "4. MASTER SUMMARY"
Add-Content $outputFile "============================================================"

$totalEngines =
    $engineSummary.Count

$pipelineConnected =
    (
        $engineSummary |
        Where-Object {
            $_.Status -eq
            "PIPELINE_CONNECTED"
        }
    ).Count

$scriptConnected =
    (
        $engineSummary |
        Where-Object {
            $_.Status -eq
            "SCRIPT_CONNECTED"
        }
    ).Count

$engineConnected =
    (
        $engineSummary |
        Where-Object {
            $_.Status -eq
            "ENGINE_CONNECTED"
        }
    ).Count

$isolated =
    (
        $engineSummary |
        Where-Object {
            $_.Status -eq
            "ISOLATED"
        }
    ).Count

$totalResults =
    $resultSummary.Count

$mainResults =
    (
        $resultSummary |
        Where-Object {
            $_.Status -eq
            "MAIN_ORCHESTRATOR_CONNECTED"
        }
    ).Count

$indirectResults =
    (
        $resultSummary |
        Where-Object {
            $_.Status -eq
            "INDIRECTLY_CONNECTED"
        }
    ).Count

$unreferencedResults =
    (
        $resultSummary |
        Where-Object {
            $_.Status -eq
            "UNREFERENCED"
        }
    ).Count

$emptyResults =
    (
        $resultSummary |
        Where-Object {
            $_.Status -eq
            "EMPTY"
        }
    ).Count

Add-Content $outputFile ""
Add-Content $outputFile "ENGINES DISCOVERED: $totalEngines"
Add-Content $outputFile "PIPELINE CONNECTED ENGINES: $pipelineConnected"
Add-Content $outputFile "SCRIPT CONNECTED ENGINES: $scriptConnected"
Add-Content $outputFile "ENGINE CONNECTED ENGINES: $engineConnected"
Add-Content $outputFile "ISOLATED ENGINES: $isolated"

Add-Content $outputFile ""
Add-Content $outputFile "RESULT DIRECTORIES: $totalResults"
Add-Content $outputFile "MAIN ORCHESTRATOR RESULTS: $mainResults"
Add-Content $outputFile "INDIRECTLY CONNECTED RESULTS: $indirectResults"
Add-Content $outputFile "UNREFERENCED RESULTS: $unreferencedResults"
Add-Content $outputFile "EMPTY RESULTS: $emptyResults"

Add-Content $outputFile ""
Add-Content $outputFile "PIPELINES DISCOVERED: $($pipelineFiles.Count)"

Add-Content $outputFile ""
Add-Content $outputFile ""
Add-Content $outputFile "============================================================"
Add-Content $outputFile "5. POSSIBLE ARCHITECTURAL DEAD ENDS"
Add-Content $outputFile "============================================================"

foreach (
    $engine in (
        $engineSummary |
        Where-Object {
            $_.Status -eq
            "ISOLATED"
        }
    )
) {

    Add-Content `
        $outputFile `
        "ISOLATED ENGINE: $($engine.Engine) -> $($engine.File)"

}

foreach (
    $result in (
        $resultSummary |
        Where-Object {
            $_.Status -eq
            "UNREFERENCED"
        }
    )
) {

    Add-Content `
        $outputFile `
        "UNREFERENCED RESULT: $($result.Directory)"

}

foreach (
    $result in (
        $resultSummary |
        Where-Object {
            $_.Status -eq
            "EMPTY"
        }
    )
) {

    Add-Content `
        $outputFile `
        "EMPTY RESULT: $($result.Directory)"

}

Write-Host ""
Write-Host "===================================="
Write-Host "OECL V2 MASTER DATA FLOW AUDIT"
Write-Host "===================================="
Write-Host ""
Write-Host "Engines:" $totalEngines
Write-Host "Pipeline connected:" $pipelineConnected
Write-Host "Script connected:" $scriptConnected
Write-Host "Engine connected:" $engineConnected
Write-Host "Isolated:" $isolated
Write-Host ""
Write-Host "Result directories:" $totalResults
Write-Host "Main orchestrator results:" $mainResults
Write-Host "Indirectly connected results:" $indirectResults
Write-Host "Unreferenced results:" $unreferencedResults
Write-Host "Empty results:" $emptyResults
Write-Host ""
Write-Host "Pipelines:" $pipelineFiles.Count
Write-Host ""
Write-Host "Audit created:"
Write-Host $outputFile