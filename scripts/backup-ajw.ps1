param(
  [string]$ConfigPath = "D:\CODEX\AJW\ajw.stack.config.json"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ConfigPath)) {
  throw "Config tidak ditemukan: $ConfigPath"
}

$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
$workspace = $config.project.workspacePath
$backupRoot = $config.backup.path
$keepLatest = [int]$config.backup.keepLatest

if (-not (Test-Path -LiteralPath $backupRoot)) {
  New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipPath = Join-Path $backupRoot ("ajw-backup-" + $stamp + ".zip")

$include = @(
  "index.html",
  "analytics_override_v1.js",
  "development_override.js",
  "development_override_v2.js",
  "ajw-extracted.js",
  "ajw.stack.config.json"
)

$temp = Join-Path $env:TEMP ("ajw-backup-" + $stamp)
if (Test-Path -LiteralPath $temp) {
  Remove-Item -LiteralPath $temp -Recurse -Force
}
New-Item -ItemType Directory -Path $temp -Force | Out-Null

foreach ($file in $include) {
  $src = Join-Path $workspace $file
  if (Test-Path -LiteralPath $src) {
    Copy-Item -LiteralPath $src -Destination (Join-Path $temp ([System.IO.Path]::GetFileName($file))) -Force
  }
}

Compress-Archive -Path (Join-Path $temp "*") -DestinationPath $zipPath -Force
Remove-Item -LiteralPath $temp -Recurse -Force

$archives = Get-ChildItem -LiteralPath $backupRoot -Filter "ajw-backup-*.zip" | Sort-Object LastWriteTime -Descending
if ($archives.Count -gt $keepLatest) {
  $archives | Select-Object -Skip $keepLatest | Remove-Item -Force
}

Write-Host "Backup selesai: $zipPath" -ForegroundColor Green
