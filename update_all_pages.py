import os
import re

# index.html에서 헤더 스타일과 구조 추출
def extract_header_from_index():
    with open('index.html', 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 스타일 추출
    style_pattern = r'<style>(.*?)\/\* 메뉴 항목 스타일 \*\/.*?padding: 8px 10px;.*?<\/style>'
    style_match = re.search(style_pattern, content, re.DOTALL)
    header_style = style_match.group(0) if style_match else None
    
    # 헤더 구조 추출
    header_pattern = r'<header>.*?<\/header>'
    header_match = re.search(header_pattern, content, re.DOTALL)
    header_structure = header_match.group(0) if header_match else None
    
    # 스크립트 추출
    script_pattern = r'document\.addEventListener\(\'DOMContentLoaded\', function\(\) \{\s*\/\/ 현재 언어 표시 업데이트.*?document\.getElementById\(\'current-lang\'\)\.textContent = currentLang === \'en\' \? \'English\' : \'한국어\';'
    script_match = re.search(script_pattern, content, re.DOTALL)
    script_code = script_match.group(0) if script_match else None
    
    return header_style, header_structure, script_code

# 다른 HTML 파일에 헤더 적용
def update_html_file(filename, header_style, header_structure, script_code):
    if filename == 'index.html' or not filename.endswith('.html'):
        return
    
    with open(filename, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 스타일 업데이트
    style_pattern = r'<style>.*?<\/style>'
    if re.search(style_pattern, content, re.DOTALL):
        content = re.sub(style_pattern, header_style, content, 1, re.DOTALL)
    else:
        # 스타일 태그가 없는 경우 head 태그 안에 추가
        head_end_tag = '</head>'
        content = content.replace(head_end_tag, f'{header_style}\n{head_end_tag}')
    
    # 헤더 구조 업데이트
    header_pattern = r'<header>.*?<\/header>'
    if re.search(header_pattern, content, re.DOTALL):
        # 현재 페이지에 맞게 active 클래스 조정
        page_name = os.path.basename(filename)
        modified_header = header_structure.replace('index.html" class="active"', 'index.html"')
        modified_header = modified_header.replace(f'{page_name}"', f'{page_name}" class="active"')
        content = re.sub(header_pattern, modified_header, content, 1, re.DOTALL)
    
    # 스크립트 업데이트
    script_pattern = r'document\.addEventListener\(\'DOMContentLoaded\', function\(\) \{.*?\/\/ 언어 버튼 상태 업데이트.*?document\.getElementById\(\'en-btn\'\)\.classList\.toggle\(\'active\', currentLang === \'en\'\);.*?document\.getElementById\(\'ko-btn\'\)\.classList\.toggle\(\'active\', currentLang === \'ko\'\);'
    if re.search(script_pattern, content, re.DOTALL):
        content = re.sub(script_pattern, script_code, content, 1, re.DOTALL)
    else:
        # 언어 관련 스크립트가 없는 경우 DOMContentLoaded 이벤트 리스너 내에 추가
        dom_content_loaded_pattern = r'document\.addEventListener\(\'DOMContentLoaded\', function\(\) \{'
        if re.search(dom_content_loaded_pattern, content):
            content = re.sub(dom_content_loaded_pattern, f'{dom_content_loaded_pattern}\n            // 현재 언어 표시 업데이트\n            document.getElementById(\'current-lang\').textContent = currentLang === \'en\' ? \'English\' : \'한국어\';', content, 1)
    
    # 언어 선택기 div 제거 (이제 헤더 내에 포함됨)
    language_selector_pattern = r'<div class="language-selector">.*?<\/div>\s*'
    content = re.sub(language_selector_pattern, '', content, 1, re.DOTALL)
    
    with open(filename, 'w', encoding='utf-8') as file:
        file.write(content)
    
    print(f"Updated {filename}")

def main():
    header_style, header_structure, script_code = extract_header_from_index()
    
    if not header_style or not header_structure:
        print("Failed to extract header from index.html")
        return
    
    # 모든 HTML 파일 업데이트
    for filename in os.listdir('.'):
        if filename.endswith('.html') and filename != 'index.html' and filename != 'test1.html' and filename != 'test2.html':
            update_html_file(filename, header_style, header_structure, script_code)
    
    print("All HTML files have been updated successfully!")

if __name__ == "__main__":
    main() 