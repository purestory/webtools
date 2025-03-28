#!/bin/bash

# 현재 디렉토리를 스크립트 위치로 변경
cd "$(dirname "$0")"

echo "실행 중인 서버 확인 중..."
if [ -f backend/api/gunicorn.pid ]; then
    kill -TERM $(cat backend/api/gunicorn.pid)
    rm backend/api/gunicorn.pid
else
    pkill -f gunicorn || true
fi

echo "서버가 종료되었습니다." 