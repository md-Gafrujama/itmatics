@echo off
REM Pause Vercel DDoS mitigations for 24h so Google Search Console can fetch sitemap.
cd /d "%~dp0.."
call npx --yes vercel@latest firewall system-mitigations pause
pause
