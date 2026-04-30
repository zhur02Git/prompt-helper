from PIL import Image

img = Image.open('screenshot.jpg')
print(f'Original size: {img.size}')

orig_w, orig_h = img.size
target_w, target_h = 1280, 800

orig_ratio = orig_w / orig_h
target_ratio = target_w / target_h

if orig_ratio > target_ratio:
    new_w = int(orig_h * target_ratio)
    left = (orig_w - new_w) // 2
    img_cropped = img.crop((left, 0, left + new_w, orig_h))
else:
    new_h = int(orig_w / target_ratio)
    top = (orig_h - new_h) // 2
    img_cropped = img.crop((0, top, orig_w, top + new_h))

img_resized = img_cropped.resize((1280, 800), Image.LANCZOS)
img_resized.save('screenshot-1280x800.png', 'PNG')
print(f'Done! Saved: screenshot-1280x800.png  size: {img_resized.size}')
