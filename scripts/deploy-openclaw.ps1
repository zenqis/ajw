param(
  [string]$ConfigPath = "D:\CODEX\AJW\ajw.stack.config.json"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ConfigPath)) {
  throw "Config tidak ditemukan: $ConfigPath`nSalin ajw.stack.config.example.json menjadi ajw.stack.config.json lalu isi nilainya."
}

$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
$workspace = $config.project.workspacePath
$target = $config.openclaw.publicPath
$files = @($config.openclaw.files)

if (-not (Test-Path -LiteralPath $workspace)) {
  throw "Workspace AJW tidak ditemukan: $workspace"
}

if (-not (Test-Path -LiteralPath $target)) {
  New-Item -ItemType Directory -Path $target -Force | Out-Null
}

$copied = @()
foreach ($file in $files) {
  $sourcePath = Join-Path $workspace $file
  if (-not (Test-Path -LiteralPath $sourcePath)) {
    Write-Warning "File dilewati karena tidak ditemukan: $sourcePath"
    continue
  }
  $destPath = Join-Path $target ([System.IO.Path]::GetFileName($file))
  Copy-Item -LiteralPath $sourcePath -Destination $destPath -Force
  $copied += $destPath
}

Write-Host ""
Write-Host "Deploy OpenClaw selesai." -ForegroundColor Green
Write-Host "Target: $target"
Write-Host ""
Write-Host "File yang disalin:"
$copied | ForEach-Object { Write-Host " - $_" }
