from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    # Create a new image with a white background
    image = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)
    
    # Calculate dimensions
    padding = size // 8
    circle_radius = (size - 2 * padding) // 2
    
    # Draw the main circle
    draw.ellipse(
        [padding, padding, size - padding, size - padding],
        fill=(52, 175, 80, 255)  # Green color (#4CAF50)
    )
    
    # Draw the stock chart line
    line_points = []
    for i in range(5):
        x = padding + (i * (size - 2 * padding) // 4)
        y = size - padding - (circle_radius * (0.5 + 0.5 * (i % 2)))  # Alternating up/down pattern
        line_points.append((x, y))
    
    # Draw the line
    draw.line(line_points, fill=(255, 255, 255, 255), width=max(1, size // 16))
    
    # Draw the arrow at the end
    last_point = line_points[-1]
    arrow_size = size // 8
    if line_points[-1][1] < line_points[-2][1]:  # If going up
        draw.polygon([
            (last_point[0], last_point[1] - arrow_size),
            (last_point[0] - arrow_size//2, last_point[1]),
            (last_point[0] + arrow_size//2, last_point[1])
        ], fill=(255, 255, 255, 255))
    else:  # If going down
        draw.polygon([
            (last_point[0], last_point[1] + arrow_size),
            (last_point[0] - arrow_size//2, last_point[1]),
            (last_point[0] + arrow_size//2, last_point[1])
        ], fill=(255, 255, 255, 255))
    
    return image

def main():
    # Create icons directory if it doesn't exist
    if not os.path.exists('icons'):
        os.makedirs('icons')
    
    # Generate icons in different sizes
    sizes = [16, 48, 128]
    for size in sizes:
        icon = create_icon(size)
        icon.save(f'icons/icon{size}.png')

if __name__ == '__main__':
    main() 