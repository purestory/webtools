#!/bin/bash

# 현재 디렉토리를 스크립트 위치로 변경
cd "$(dirname "$0")"

echo "이전에 실행 중인 서버 확인 중..."
./stop_server.sh

# 가상환경 활성화
source venv/bin/activate

# API 디렉토리 확인
mkdir -p backend/api/uploads/images backend/api/uploads/subtitles

# WSGI 서버 시작
echo "WSGI 서버 시작 중..."
gunicorn --workers 3 \
         --bind 0.0.0.0:3801 \
         --daemon \
         --log-level debug \
         --error-logfile /home/purestory/converter/backend/api/gunicorn_error.log \
         --access-logfile /home/purestory/converter/backend/api/gunicorn_access.log \
         --pid /home/purestory/converter/backend/api/gunicorn.pid \
         --chdir /home/purestory/converter/backend/api \
         wsgi:app

# 서버 상태 확인
echo "서버가 백그라운드에서 실행 중입니다."
echo "로그를 확인하려면: tail -f backend/api/gunicorn_error.log"
echo "서버를 중지하려면: ./stop_server.sh" 