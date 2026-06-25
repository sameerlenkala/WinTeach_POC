"""
Combine all extracted JSX component files into a single reference file.
"""
import os

# Order matches the template.html script loading order
component_files = [
    '940bdbe7.js',   # Data/WINNIFY globals  
    '5b83ac2a.js',   # Icons
    '008a4e42.js',   # Shared UI (Sidebar, Topbar, Modal, Toast, PhaseChip, Pct, Placeholder)
    '2d2aeb7f.js',   # SO-01/SO-02 Sessions list
    '314abc03.js',   # Setup wizard (slog:setup-1, slog:setup-2, slog:setup-3)
    '8ba314cc.js',   # Dashboard (slog:dashboard)
    '196b715e.js',   # Phase screens (slog:phase, PhaseBar, PowerplayBody, FinalOverBody)
    '7b27f3d0.js',   # Cluster/Powerplay detail (slog:cluster, slog:adaptive)
    '34b08add.js',   # Interview Prep (slog:interview-prep, slog:powerplay-topic)
    '6d396665.js',   # Utilities (WUTIL, FO helpers)
    'e2c6e3f6.js',   # Acceleration (slog:acceleration, AccelerationBody)
    'cb7b75b0.js',   # Final Over extras (slog:mock, slog:mock-assessment, slog:gd-simulation)
    '5799e759.js',   # Resume (slog:resume)
    '03bacb41.js',   # Modals + misc screens (Day View, FO complete, etc.)
    '7cbbf429.js',   # App root / router
    '176bd1e1.js',   # Interview Cues (slog:interview-cues)
]

base_dir = r'D:\Projects\winnify\winnify_90day_plan\winnify\_extracted'
output_path = r'D:\Projects\winnify\winnify_90day_plan\winnify\_extracted\COMBINED_SOURCE.js'

lines_written = 0
with open(output_path, 'w', encoding='utf-8') as out:
    for fname in component_files:
        fpath = os.path.join(base_dir, fname)
        if os.path.exists(fpath):
            size = os.path.getsize(fpath)
            out.write(f'\n\n// ═══════════════════════════════════════════════════════════════════\n')
            out.write(f'// FILE: {fname} ({size:,} bytes)\n')
            out.write(f'// ═══════════════════════════════════════════════════════════════════\n\n')
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            out.write(content)
            lines = content.count('\n')
            lines_written += lines
            print(f'  {fname}: {size:,} bytes, {lines} lines')
        else:
            print(f'  MISSING: {fname}')

print(f'\nTotal: {lines_written} lines written to COMBINED_SOURCE.js')
print(f'Output: {output_path}')
