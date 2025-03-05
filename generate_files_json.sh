#!/bin/bash

echo '{' > files.json
echo '  "drums": [' >> files.json
ls sounds/drums/*.webm 2>/dev/null | sed 's/sounds\/drums\///' | sed 's/\(.*\)/"\1",/' | sed '$ s/,$//' >> files.json
echo '  ],' >> files.json
echo '  "effects": [' >> files.json
ls sounds/effects/*.webm 2>/dev/null | sed 's/sounds\/effects\///' | sed 's/\(.*\)/"\1",/' | sed '$ s/,$//' >> files.json
echo '  ],' >> files.json
echo '  "trump-zel": [' >> files.json
ls sounds/trump-zel/*.webm 2>/dev/null | sed 's/sounds\/trump-zel\///' | sed 's/\(.*\)/"\1",/' | sed '$ s/,$//' >> files.json
echo '  ]' >> files.json
echo '}' >> files.json