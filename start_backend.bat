@echo off
setlocal
cd /d "%~dp0"

REM Python 3.12 (FastAPI / pydantic uchun; 3.14 hozircha muammoli bo'lishi mumkin)
set PY=py -3.12
%PY% --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python 3.12 topilmadi. "py -3.12" ishlaydimi tekshiring yoki winget bilan o'rnating:
    echo     winget install -e --id Python.Python.3.12
    pause
    exit /b 1
)

if not exist ".venv\" (
    echo Virtual muhit yaratilmoqda ^(.venv, Python 3.12^)...
    %PY% -m venv .venv
    if errorlevel 1 (
        echo [X] venv yaratib bo'lmadi.
        pause
        exit /b 1
    )
)

echo Virtual muhit faollashtirilmoqda...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [X] activate.bat topilmadi.
    pause
    exit /b 1
)

echo Paketlar o'rnatilmoqda / yangilanmoqda...
python -m pip install -q --upgrade pip
python -m pip install -r backend\requirements.txt
if errorlevel 1 (
    echo [X] pip install xato.
    pause
    exit /b 1
)

echo.
echo FastAPI: http://127.0.0.1:8000  ^(Ctrl+C to'xtatish^)
echo.
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
