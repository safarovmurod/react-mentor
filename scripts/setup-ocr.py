#!/usr/bin/env python3
"""Install pinned, integrity-checked Tesseract language data in the task cache."""
import argparse
import hashlib
import shutil
import urllib.request
from pathlib import Path

HASHES = {
    'eng':'7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2',
    'rus':'e16e5e036cce1d9ec2b00063cf8b54472625b9e14d893a169e2b0dedeb4df225',
    'tgk':'7b32ed1374649b9b44b9a20ed07f1e86c1e1004c3bd11ce182496a47a18cb321',
}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory',type=Path,default=Path('/workspace/.cache/react-mentor-ocr/tessdata'))
    args=parser.parse_args()
    for command in ('pdftotext','pdftoppm','tesseract'):
        if not shutil.which(command):
            parser.error('Missing required system tool: '+command)
    args.directory.mkdir(parents=True,exist_ok=True)
    for language,expected in HASHES.items():
        target=args.directory/(language+'.traineddata')
        if target.is_file() and hashlib.sha256(target.read_bytes()).hexdigest()==expected:
            continue
        with urllib.request.urlopen('https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/4.1.0/'+language+'.traineddata',timeout=45) as response:
            data=response.read(10*1024*1024+1)
        if hashlib.sha256(data).hexdigest()!=expected:
            raise ValueError('Language data checksum mismatch: '+language)
        temporary=target.with_suffix('.part')
        temporary.write_bytes(data)
        temporary.replace(target)
    print('Verified OCR languages: eng, rus, tgk')

if __name__=='__main__':
    main()
