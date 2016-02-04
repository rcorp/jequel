@echo on
setlocal enabledelayedexpansion enableextensions
set LIST=
for /f "delims=" %%x in ('forfiles /s /m *.coffee /c "cmd /c echo @relpath"') do (
set LIST=!LIST! %%x
)

set LIST=%LIST:~1%

docco -o ./docs/out/ %LIST%
