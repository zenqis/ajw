# AJW Stack Setup

Panduan ini membuat AJW tetap rapi, aman, dan mudah dipelihara dengan 4 lapis:

1. Lokal untuk runtime dan kerja harian
2. Supabase untuk database operasional
3. GitHub untuk source code dan history perubahan
4. OpenClaw untuk agent AI / bridge ke Codex

## 1. Struktur yang disarankan

- `D:\CODEX\AJW`
  Workspace utama AJW. Semua edit Codex dilakukan di sini.
- `\\wsl.localhost\Ubuntu\home\hokkyalxndr\.openclaw\workspace\bridge-proxy\public`
  Folder publish untuk OpenClaw / bridge-proxy.
- Supabase
  Database utama AJW.
- GitHub
  Backup source code + versioning.

## 2. File config

1. Salin file:

   - `D:\CODEX\AJW\ajw.stack.config.example.json`
   - menjadi `D:\CODEX\AJW\ajw.stack.config.json`

2. Isi nilai:

   - `openclaw.bridgeEndpoint`
   - `openclaw.publicPath`
   - `supabase.projectUrl`
   - `supabase.anonKey`
   - `github.repo`
   - `backup.path`

## 3. Alur kerja harian

### A. Edit sistem

Semua perubahan selalu dikerjakan di:

- `D:\CODEX\AJW`

Jangan edit file langsung di folder OpenClaw `public`.

### B. Backup dulu

Jalankan:

```powershell
powershell -ExecutionPolicy Bypass -File D:\CODEX\AJW\scripts\backup-ajw.ps1
```

### C. Publish ke OpenClaw

Setelah AJW diperbarui dan sudah dicek:

```powershell
powershell -ExecutionPolicy Bypass -File D:\CODEX\AJW\scripts\deploy-openclaw.ps1
```

Script ini akan menyalin file penting dari AJW ke folder `public` OpenClaw.

## 4. Penggunaan Supabase

Gunakan Supabase untuk:

- data operasional
- HR
- Finance
- Tools
- Analytics
- customer data
- logs
- bridge / webhook metadata

Jangan simpan service role key di frontend AJW.

## 5. Penggunaan GitHub

GitHub dipakai untuk:

- source code AJW
- history perubahan
- rollback
- kolaborasi versi

GitHub tidak dipakai sebagai database operasional.

### Langkah dasar GitHub

```powershell
git init
git add .
git commit -m "Initial AJW stack"
git branch -M main
git remote add origin https://github.com/USERNAME/ajw.git
git push -u origin main
```

## 6. Penggunaan OpenClaw

AJW mengirim task ke endpoint bridge, misalnya:

- `http://localhost:3000/api/agent/run`

Dashboard OpenClaw tetap bisa dipantau di:

- `http://127.0.0.1:18789/`

Gateway WebSocket:

- `ws://127.0.0.1:18789`

## 7. Praktik aman

- Edit hanya di workspace utama AJW
- Backup sebelum deploy
- Publish ke OpenClaw hanya lewat script
- Simpan data operasional di Supabase
- Simpan source code di GitHub
- Gunakan OpenClaw sebagai orchestration / AI core
- Gunakan Codex sebagai executor coding

## 8. Workflow terbaik

1. Edit di `D:\CODEX\AJW`
2. Test AJW lokal
3. Jalankan backup
4. Commit ke GitHub
5. Deploy ke OpenClaw public
6. Test bridge / AI / website hasil publish

Dengan pola ini, AJW tetap:

- rapi
- aman
- bisa rollback
- tidak bergantung pada satu tempat saja
