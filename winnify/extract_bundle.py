import re, base64, gzip, json, os

html_path = r'D:\Projects\winnify\winnify_90day_plan\winnify\Slog Overs _standalone_ (4) (1).html'
output_dir = r'D:\Projects\winnify\winnify_90day_plan\winnify\_extracted'
os.makedirs(output_dir, exist_ok=True)

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

print(f'Total HTML size: {len(content):,} bytes')

# Find all script types
script_types = re.findall(r'<script type="([^"]+)">', content)
print(f'Script types found: {script_types}')

# Extract manifest
manifest_start = content.find('<script type="__bundler/manifest">')
if manifest_start != -1:
    manifest_end = content.find('</script>', manifest_start)
    open_tag_end = content.find('>', manifest_start) + 1
    manifest_json = content[open_tag_end:manifest_end]
    print(f'Manifest JSON length: {len(manifest_json):,}')
    manifest = json.loads(manifest_json)
    print(f'Manifest entries: {len(manifest)}')
    for k, v in list(manifest.items()):
        print(f'  {k}: mime={v["mime"]}, compressed={v.get("compressed", False)}, data_b64_len={len(v["data"])}')

    # Extract and decompress each asset
    for uuid, entry in manifest.items():
        data = base64.b64decode(entry['data'])
        if entry.get('compressed'):
            try:
                data = gzip.decompress(data)
            except Exception as e:
                print(f'  Decompression error for {uuid}: {e}')
                continue
        ext = '.js' if 'javascript' in entry['mime'] else '.css' if 'css' in entry['mime'] else '.bin'
        out_path = os.path.join(output_dir, f'{uuid[:8]}{ext}')
        with open(out_path, 'wb') as f:
            f.write(data)
        print(f'  Wrote {uuid[:8]}{ext}: {len(data):,} bytes')
else:
    print('No manifest found!')

# Extract template
template_start = content.find('<script type="__bundler/template">')
if template_start != -1:
    template_end = content.find('</script>', template_start)
    open_tag_end = content.find('>', template_start) + 1
    template_json = content[open_tag_end:template_end]
    # template is a JSON-encoded HTML string
    print(f'Template JSON length: {len(template_json):,}')
    template_html = json.loads(template_json)
    out_path = os.path.join(output_dir, 'template.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(template_html)
    print(f'  Wrote template.html: {len(template_html):,} chars')
else:
    print('No template found!')

print('Done!')
