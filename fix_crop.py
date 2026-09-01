with open('app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find the CropOverlay section and replace it
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if 'displayWidth={displayDims.width}' in line:
        # We found the CropOverlay section, replace this block
   …(1548 chars)