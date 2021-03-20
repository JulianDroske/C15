@echo off
copy C:\Users\baban\Desktop\hw.docx .\hw.docx
7z e -y -o. .\hw.docx word/document.xml
node hwconv.js .\document.xml C:\Users\baban\Desktop\hw.out.txt
