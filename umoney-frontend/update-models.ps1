# PowerShell script to update model files with new versions

# List of files to update
$files = @(
    "CategoryModel",
    "TagModel",
    "TransactionModel",
    "RecipientModel"
)

# Loop through each file and replace the old one with the new one
foreach ($file in $files) {
    $oldFile = "src/models/$file.js"
    $newFile = "src/models/$file.new.js"
    
    # Check if both files exist
    if ((Test-Path $oldFile) -and (Test-Path $newFile)) {
        Write-Host "Updating $oldFile with $newFile..."
        
        # Create a backup of the old file
        Copy-Item $oldFile "$oldFile.bak" -Force
        
        # Replace the old file with the new one
        Move-Item $newFile $oldFile -Force
        
        Write-Host "Updated $oldFile successfully."
    } else {
        Write-Host "Error: Could not find $oldFile or $newFile"
    }
}

Write-Host "Model files update completed."
