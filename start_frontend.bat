@echo off
setlocal
cd /d "%~dp0"
echo Frontend jildiga o'tilmoqda...
cd frontend
echo Paketlar tekshirilmoqda...
call npm.cmd install
echo Server ishga tushirilmoqda...
call npm.cmd run dev
pause
