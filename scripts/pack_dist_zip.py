import os
import zipfile

def zip_directory(folder_path, output_path):
    print(f"Creating {output_path} from {folder_path}...")
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if file.endswith('.zip'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, os.path.dirname(folder_path.rstrip('/\\')))
                zipf.write(full_path, rel_path)
    print(f"Successfully generated {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    os.makedirs("public", exist_ok=True)
    if os.path.exists("dist"):
        zip_directory("dist", "public/dist-only.zip")
    else:
        print("dist directory not found!")
