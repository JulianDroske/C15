# C8 extended functions
## alias: C15Support

Originally 'C15Support' is just a program that loads C8UI as a wallpaper.
Now it has a new function: converts a docx file into .txt format and send it to C8UI.

Files:

```
hw.docx: A templet that should be correspond with the path in C8API
document.xml: Extracted tempory file from hw.docx for hwconv to handle.
JuRw.js: A library in JuRt Project, is a special version for Web.
hwconv.js: Main Converter. Usage: node hwconv.js <document.xml> <outputPath>
hwconv2.js: Minor Converter, only do uploads for C8API. Usage: node hwconv2.js <hw.txt>
hwconv2.bat: Bootstrap for hwconv2.js
hwconv2.vbs: Bootstrap for hwconv2.bat
hwconv.bat: Bootstrap for hwconv.js
hwconv.vbs: Bootstrap for hwconv.bat
main.bat: Used to run Wallpaper.
C15S: alias C15Support, a custom wallpaper engine.
```

The wallpaper engine is built under Qt 5.9.0 with MSVC2019 32-bit
It's originally from another open source project, but I cannot remember the link.
Deleted UI and custom web page path support. Web pages are at C15S/www

All executable binary files are all compatible with Windows7 32-bit and newer versions.


