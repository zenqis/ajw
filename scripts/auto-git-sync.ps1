param(
  [string]$RepoPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [int]$DebounceSeconds = 4,
  [string]$CommitPrefix = "auto update"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Info([string]$msg) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "[$ts] $msg"
}

function Invoke-GitSync {
  Set-Location $RepoPath

  & git rev-parse --is-inside-work-tree 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Info "Folder bukan git repository: $RepoPath"
    return
  }

  # Stage semua perubahan.
  & git add -A

  # Jika tidak ada perubahan staged, hentikan.
  & git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) {
    return
  }

  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $message = "$CommitPrefix $stamp"
  & git commit -m $message
  if ($LASTEXITCODE -ne 0) {
    Write-Info "Commit gagal, menunggu perubahan berikutnya."
    return
  }

  # Coba push ke upstream branch aktif. Jika belum ada upstream, fallback ke origin <branch>.
  & git push
  if ($LASTEXITCODE -eq 0) {
    Write-Info "Push sukses."
    return
  }

  $branch = (& git rev-parse --abbrev-ref HEAD).Trim()
  if ([string]::IsNullOrWhiteSpace($branch)) {
    Write-Info "Tidak bisa membaca nama branch aktif."
    return
  }

  & git push -u origin $branch
  if ($LASTEXITCODE -eq 0) {
    Write-Info "Push sukses dan upstream branch diset."
  } else {
    Write-Info "Push gagal. Cek koneksi atau kredensial GitHub."
  }
}

$state = [ordered]@{
  Pending = $false
  LastEventAt = Get-Date
  IsSyncing = $false
}

Write-Info "Menjalankan auto git sync..."
Write-Info "RepoPath: $RepoPath"
Write-Info "Debounce: $DebounceSeconds detik"
Write-Info "Tekan Ctrl+C untuk berhenti."

$fsw = New-Object System.IO.FileSystemWatcher
$fsw.Path = $RepoPath
$fsw.IncludeSubdirectories = $true
$fsw.EnableRaisingEvents = $true
$fsw.NotifyFilter = [IO.NotifyFilters]'FileName, DirectoryName, LastWrite, CreationTime'
$fsw.Filter = '*'

$action = {
  # Abaikan event dalam folder .git agar tidak loop.
  $fullPath = $Event.SourceEventArgs.FullPath
  if ($fullPath -match '[\\/]\.git([\\/]|$)') { return }

  $state.Pending = $true
  $state.LastEventAt = Get-Date
}

$subs = @()
$subs += Register-ObjectEvent -InputObject $fsw -EventName Changed -Action $action
$subs += Register-ObjectEvent -InputObject $fsw -EventName Created -Action $action
$subs += Register-ObjectEvent -InputObject $fsw -EventName Deleted -Action $action
$subs += Register-ObjectEvent -InputObject $fsw -EventName Renamed -Action $action

try {
  while ($true) {
    Start-Sleep -Milliseconds 700

    if (-not $state.Pending) { continue }
    if ($state.IsSyncing) { continue }

    $elapsed = ((Get-Date) - $state.LastEventAt).TotalSeconds
    if ($elapsed -lt $DebounceSeconds) { continue }

    $state.IsSyncing = $true
    $state.Pending = $false
    try {
      Invoke-GitSync
    } catch {
      Write-Info ("Error: " + $_.Exception.Message)
    } finally {
      $state.IsSyncing = $false
    }
  }
}
finally {
  foreach ($sub in $subs) {
    try { Unregister-Event -SubscriptionId $sub.Id } catch {}
    try { $sub | Remove-Job -Force } catch {}
  }
  try { $fsw.EnableRaisingEvents = $false } catch {}
  try { $fsw.Dispose() } catch {}
  Write-Info "Auto git sync berhenti."
}
