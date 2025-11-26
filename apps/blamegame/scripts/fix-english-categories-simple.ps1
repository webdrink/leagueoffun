#!/usr/bin/env pwsh

# Fix missing category fields in English question files

$questionsDir = "c:\Users\pbziu\OneDrive\Dokumente\Development\blamegame\public\questions\en"

# Get all JSON files in the English questions directory
$jsonFiles = Get-ChildItem -Path $questionsDir -Filter "*.json"

foreach ($file in $jsonFiles) {
    $categoryName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $filePath = $file.FullName
    
    Write-Host "Processing $($file.Name) with category '$categoryName'..."
    
    try {
        # Read the JSON content
        $content = Get-Content -Path $filePath -Raw | ConvertFrom-Json
        
        # Check if it's an array of questions
        if ($content -is [Array]) {
            $modified = $false
            
            # Add category field to each question if missing
            for ($i = 0; $i -lt $content.Length; $i++) {
                if (-not $content[$i].PSObject.Properties["category"]) {
                    $content[$i] | Add-Member -MemberType NoteProperty -Name "category" -Value $categoryName
                    $modified = $true
                }
                elseif ($content[$i].category -ne $categoryName) {
                    $content[$i].category = $categoryName
                    $modified = $true
                }
            }
            
            if ($modified) {
                # Convert back to JSON with proper formatting
                $jsonOutput = $content | ConvertTo-Json -Depth 10
                
                # Write back to file
                $jsonOutput | Set-Content -Path $filePath -Encoding UTF8
                Write-Host "✅ Fixed $($file.Name) - Added category field to questions"
            } else {
                Write-Host "✅ $($file.Name) already has correct category fields"
            }
        } else {
            Write-Warning "⚠️ $($file.Name) is not an array of questions"
        }
    }
    catch {
        Write-Error "❌ Error processing $($file.Name): $($_.Exception.Message)"
    }
}

Write-Host "`n🎉 Finished processing English question files!"
