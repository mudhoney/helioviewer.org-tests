#!/bin/bash

echo "Content-type: text/plain"
echo ""

url_decode() {
    python3 -c "import urllib.parse; print(urllib.parse.unquote(input()))"
}

# Extract query parameters
test=$(echo "$QUERY_STRING" | sed -n 's/^.*test=\([^&]*\).*$/\1/p' | url_decode)
actual=$(echo "$QUERY_STRING" | sed -n 's/^.*actual=\([^&]*\).*$/\1/p' | url_decode)
projectName=$(echo "$QUERY_STRING" | sed -n 's/^.*projectName=\([^&]*\).*$/\1/p' | url_decode)
attachmentName=$(echo "$QUERY_STRING" | sed -n 's/^.*attachmentName=\([^&]*\).*$/\1/p' | url_decode)

attachmentName=$(echo "$attachmentName" | sed "s/actual/$projectName-linux/g")
attachmentName=$(echo "$attachmentName" | sed 's/ /-/g')


if [ "$(dirname "$actual")" != "data" ]; then
    echo "Error: Invalid actual file path"
    exit 1
fi

# Validate input parameters
if [[ "$test" == *"../"* || "$actual" == *"../"* || "$projectName" == *"../"* || "$attachmentName" == *"../"* ]]; then
    echo "Error: Invalid input parameters"
    exit 1
fi

# Move the actual file to the snapshots directory
test_dir="../tests"

echo cp "$actual" "$test_dir/$test-snapshots/$attachmentName"
cp "$actual" "$test_dir/$test-snapshots/$attachmentName"
git add -f "$test_dir/$test-snapshots/$attachmentName"
