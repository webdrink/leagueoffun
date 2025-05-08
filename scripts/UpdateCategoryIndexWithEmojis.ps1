# PowerShell script to update the category index with emoji information

# Read the files
$indexPath = Join-Path $PSScriptRoot "..\public\categories\index.json"
$categoriesPath = Join-Path $PSScriptRoot "..\public\categories.json"

try {
    $categoryIndex = Get-Content $indexPath -Raw | ConvertFrom-Json
    $categories = Get-Content $categoriesPath -Raw | ConvertFrom-Json
    
    Write-Host "Read $($categoryIndex.Count) categories from index"
    Write-Host "Read $($categories.Count) category emoji mappings"
}
catch {
    Write-Error "Error reading files: $_"
    exit 1
}

# Create a mapping of category names to emojis
$emojiMap = @{}
foreach ($cat in $categories) {
    $emojiMap[$cat.category] = $cat.emoji
}

# Update the category index with emojis
$updatedIndex = @()
foreach ($indexItem in $categoryIndex) {
    $emoji = if ($emojiMap.ContainsKey($indexItem.name)) { $emojiMap[$indexItem.name] } else { "❓" }
    $indexItem | Add-Member -NotePropertyName "emoji" -NotePropertyValue $emoji -Force
    $updatedIndex += $indexItem
}

try {
    $updatedIndex | ConvertTo-Json -Depth 10 | Set-Content $indexPath
    Write-Host "Updated $($updatedIndex.Count) categories with emoji information"
}
catch {
    Write-Error "Error writing updated index: $_"
    exit 1
}

Write-Host "Category index update complete!"
