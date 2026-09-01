with open('app/page.tsx', 'r') as f:
    content = f.read()

# Update the displayDimension computation to scale
content = content.replace(
    "  // Compute display dimensions for crop overlay
  const isRotated90 = store.editStat…(888 chars)