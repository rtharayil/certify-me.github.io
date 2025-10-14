import os

# Source and target directories
source_dir = "_certificate-templates"
target_dir = "_credential-templates"

# Create target directory if it doesn't exist
os.makedirs(target_dir, exist_ok=True)

# Loop over all .md files in source directory
for filename in os.listdir(source_dir):
    if filename.endswith(".md"):
        # Remove extension for permalink and redirect_to
        name_without_ext = os.path.splitext(filename)[0]

        # Prepare redirect content
        content = f"""---
layout: redirected
sitemap: false
permalink: /credential-templates/{name_without_ext}
redirect_to: /certificate-templates/{name_without_ext}
---
"""

        # Path for new file
        target_file_path = os.path.join(target_dir, filename)

        # Write content to target file
        with open(target_file_path, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"Created redirect for: {filename}")
