$ErrorActionPreference = "Stop"

$root = Resolve-Path "."
$outputFile =
    ".\architecture-audit-results\OECL-V2-NON-PIPELINE-ENGINE-AUDIT.txt"

"OECL V2 - NON PIPELINE ENGINE AUDIT" |
    Set-Content $outputFile

$engineFiles =
    Get-ChildItem `
        -Path .\laboratory `
        -Recurse `
        -Filter "*Engine.ts" `
        -File

$pipelineFiles =
    Get-ChildItem `
        -Path .\laboratory\orchestration `
        -Recurse `
        -Filter "*Pipeline.ts" `
        -File

foreach ($engineFile in $engineFiles) {

    $engineName =
        [System.IO.Path]::GetFileNameWithoutExtension(
            $engineFile.Name
        )

    $pipelineMatches =
        $pipelineFiles |
        Select-String `
            -Pattern $engineName `
            -SimpleMatch `
            -ErrorAction SilentlyContinue

    if ($pipelineMatches.Count -gt 0) {
        continue
    }

    $allMatches =
        Get-ChildItem `
            -Path . `
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

    Add-Content $outputFile ""
    Add-Content $outputFile "============================================================"
    Add-Content $outputFile "ENGINE: $engineName"
    $rootPath =
    $root.Path.TrimEnd("\")

$relativePath =
    $engineFile.FullName.Substring(
        $rootPath.Length
    ).TrimStart("\")

Add-Content $outputFile "FILE: $relativePath"

Add-Content $outputFile "FILE: $relativePath"
    Add-Content $outputFile "TOTAL EXTERNAL REFERENCES: $($allMatches.Count)"

    foreach ($match in $allMatches) {

        $relative =
            $match.Path.Replace(
                "$root\",
                ""
            )

        Add-Content `
            $outputFile `
            "  -> $relative : $($match.LineNumber)"
    }
}

Write-Host ""
Write-Host "Audit created:"
Write-Host $outputFile