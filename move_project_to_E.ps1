param(
  [string]$Destination = "E:\CSE470 project\coursemanager-master"
)

$source = (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Write-Host "Copying from $source to $Destination"

if (-not (Test-Path $Destination)) {
  New-Item -ItemType Directory -Path $Destination -Force | Out-Null
}

# Use robocopy for a reliable recursive copy. This preserves most attributes and handles large trees.
$robocopyOptions = "/MIR /COPY:DAT /R:3 /W:5 /NFL /NDL /NJH /NJS"
robocopy "$source" "$Destination" * $robocopyOptions
$exit = $LASTEXITCODE
if ($exit -lt 8) {
  Write-Host "Copy completed with exit code $exit"
} else {
  Write-Error "robocopy failed with exit code $exit"
}

Write-Host "Done. Please inspect the destination and run 'npm install' there if needed."