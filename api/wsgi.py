#!/usr/bin/env python
# -*- coding: utf-8 -*-

from app import app

# Flask 개발 서버 실행 코드 제거
# if __name__ == "__main__":
#     # 개발 환경에서만 사용
#     app.run(host='0.0.0.0', port=5000)
    
# 프로덕션 환경에서는 다음과 같이 실행:
# gunicorn -w 3 -b 127.0.0.1:5000 api.wsgi:app --daemon 