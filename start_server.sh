#!/bin/bash

# 현재 디렉토리로 이동
cd "$(dirname "$0")"

# 가상 환경 활성화
source venv/bin/activate

# 이전에 실행 중인 서버 확인 및 종료
echo "이전에 실행 중인 서버 확인 중..."
pkill -f "gunicorn -w 3 -b 127.0.0.1:5000 api.wsgi:app" || true
pkill -f "python api/app.py" || true  # Flask 개발 서버도 종료

# 잠시 대기
sleep 2

# 서버 시작
echo "WSGI 서버 시작 중..."
gunicorn -w 3 -b 127.0.0.1:5000 api.wsgi:app --log-level info --daemon

# 서버 상태 확인
sleep 2
echo "서버 상태 확인 중..."
curl -s http://localhost:5000/api/status

echo "서버가 백그라운드에서 실행 중입니다."
echo "로그를 확인하려면: tail -f /var/log/gunicorn.log"
echo "서버를 중지하려면: ./stop_server.sh" 