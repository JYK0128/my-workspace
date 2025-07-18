@echo off
setlocal enabledelayedexpansion

REM === 복사 대상 경로를 설정하세요 ===
set "DESTINATION=C:\Users\wlsyo\Documents\GitHub\copied"

REM 현재 디렉터리 저장
set "SOURCE=%CD%"

echo 원본: %SOURCE%
echo 대상: %DESTINATION%
echo -----------------------------

REM .env.* 파일 검색 및 복사
for /R %%F in (*.env.*) do (
    REM 상대 경로 계산
    set "FULLPATH=%%F"
    set "RELATIVE=%%F"
    set "RELATIVE=!RELATIVE:%SOURCE%=!"

    REM 대상 경로 생성
    set "TARGET_PATH=%DESTINATION%!RELATIVE!"
    set "TARGET_DIR=!TARGET_PATH!\.."

    REM 대상 폴더가 없으면 생성
    if not exist "!TARGET_DIR!" (
        mkdir "!TARGET_DIR!"
    )

    REM 파일 복사
    echo 복사: %%F → !TARGET_PATH!
    copy /Y "%%F" "!TARGET_PATH!" >nul
)

echo -----------------------------
echo 복사 완료!
pause