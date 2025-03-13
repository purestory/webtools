import os
import re

# HTML 파일 목록 가져오기
html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file_name in html_files:
    with open(file_name, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # nav-links 클래스 스타일 수정
    pattern = r'\.nav-links\s*{[^}]*}'
    replacement = '.nav-links {\n            display: flex;\n            justify-content: flex-start;\n            gap: 30px;\n        }'
    content = re.sub(pattern, replacement, content)
    
    with open(file_name, 'w', encoding='utf-8') as file:
        file.write(content)

print("모든 HTML 파일의 nav-links 스타일이 수정되었습니다.") 