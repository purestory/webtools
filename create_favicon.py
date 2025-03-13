from PIL import Image, ImageDraw, ImageFont
import io
import base64
import os
from io import BytesIO

# 이미지 저장 경로
favicon_dir = 'images/favicon'
os.makedirs(favicon_dir, exist_ok=True)

# 이미지 크기 설정
sizes = [16, 32, 48, 64, 128, 192, 256]

# 임시 이미지 생성 (회색 배경에 검은색 텍스트 'WT')
img = Image.new('RGB', (512, 512), color=(240, 240, 240))
draw = ImageDraw.Draw(img)

# 텍스트 추가
text = "WT"
font_size = 250
try:
    # 시스템 폰트 사용 시도
    font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
except IOError:
    # 기본 폰트 사용
    font = ImageFont.load_default()

# 텍스트 위치 계산 (중앙 정렬)
text_width, text_height = draw.textbbox((0, 0), text, font=font)[2:4]
position = ((512 - text_width) // 2, (512 - text_height) // 2)

# 텍스트 그리기
draw.text(position, text, font=font, fill=(50, 50, 50))

# 이미지를 정사각형으로 자르기
width, height = img.size
size = min(width, height)
left = (width - size) // 2
top = (height - size) // 2
right = left + size
bottom = top + size
img = img.crop((left, top, right, bottom))

# 다양한 크기의 파비콘 생성
for size in sizes:
    resized_img = img.resize((size, size), Image.Resampling.LANCZOS)
    resized_img.save(f'{favicon_dir}/favicon-{size}x{size}.png')

# ICO 파일 생성 (16x16, 32x32)
img_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
img_16.save(f'{favicon_dir}/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32)])

print('파비콘 생성 완료!') 