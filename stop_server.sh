#!/bin/bash

# 현재 디렉토리로 이동
cd "$(dirname "$0")"

# 실행 중인 서버 확인
echo "실행 중인 서버 확인 중..."
ps aux | grep "gunicorn -w 3 -b 127.0.0.1:5000 api.wsgi:app" | grep -v grep
ps aux | grep "python api/app.py" | grep -v grep  # Flask 개발 서버 확인

# 서버 종료
echo "서버 종료 중..."
pkill -f "gunicorn -w 3 -b 127.0.0.1:5000 api.wsgi:app" || echo "실행 중인 Gunicorn 서버가 없습니다."
pkill -f "python api/app.py" || echo "실행 중인 Flask 서버가 없습니다."  # Flask 개발 서버도 종료

# 확인
sleep 2
echo "서버 상태 확인 중..."
curl -s http://localhost:5000/api/status || echo "서버가 종료되었습니다." 