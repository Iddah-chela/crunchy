# Convert OpenBible cross-references to JSON index
$inputFile = "frontend/bible/cross_references.txt"
$outputFile = "frontend/bible/crossrefs.json"

$refs = @{}
$lineNum = 0

Get-Content $inputFile | ForEach-Object {
    $lineNum++
    if ($lineNum -eq 1) { return } # Skip header
    
    $parts = $_ -split "`t"
    if ($parts.Count -ge 2) {
        $from = $parts[0].Trim()
        $to = $parts[1].Trim()
        $votes = if ($parts.Count -ge 3) { [int]$parts[2] } else { 0 }
        
        if (-not $refs.ContainsKey($from)) {
            $refs[$from] = @()
        }
        # Only keep refs with >10 votes for a smaller file
        if ($votes -ge 10) {
            $refs[$from] += @{ ref = $to; votes = $votes }
        }
    }
}

# Sort each entry by votes and keep top 10
$sortedRefs = @{}
foreach ($key in $refs.Keys) {
    $sorted = $refs[$key] | Sort-Object -Property votes -Descending | Select-Object -First 10
    if ($sorted.Count -gt 0) {
        $sortedRefs[$key] = $sorted
    }
}

$json = $sortedRefs | ConvertTo-Json -Depth 4 -Compress
[System.IO.File]::WriteAllText($outputFile, $json)
Write-Host "Created crossrefs.json with $($sortedRefs.Count) entries"
