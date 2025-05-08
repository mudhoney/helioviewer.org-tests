#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Usage: $0 <playwright_report_zip_file>"
    exit 1
fi

wd="$PWD"
# Need to manually provide the zip
zip_file="$1"

temp_dir=$(mktemp -d)
unzip $zip_file -d "$temp_dir"
cd $temp_dir
cp -r data "$wd"

# Extract base64 string from index.html
base64_string=$(grep -oP 'window\.playwrightReportBase64 = "data:application/zip;base64,\K[^"]*' "$temp_dir/index.html")

# Save the base64 string to a file
echo "$base64_string" > playwright_report_base64

# Decode the base64 string into a zip file
base64 -d playwright_report_base64 > decoded_playwright_report.zip

# Unzip the decoded zip file
unzip decoded_playwright_report.zip -d unzipped_report

# Extract unexpected test outcomes from report.json and format as a valid JSON array
unexpected_tests=$(jq -c '[.files[].tests[] | select(.outcome == "unexpected")]' unzipped_report/report.json)

echo $unexpected_tests > "$wd/failed_tests.json"

cd "$wd"
python -m http.server --cgi -b 127.0.0.1 9876

# Clean up
# rm -rf "$temp_dir"

