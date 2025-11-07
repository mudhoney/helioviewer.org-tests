#!/bin/bash

# Default values
HOST="127.0.0.1"
PORT="9876"

# Parse command line arguments
while getopts "h:p:" opt; do
    case $opt in
        h) HOST="$OPTARG";;
        p) PORT="$OPTARG";;
        \?) echo "Invalid option -$OPTARG" >&2; exit 1;;
    esac
done

# Shift past the options to get the positional argument
shift $((OPTIND-1))

if [ $# -ne 1 ]; then
    echo "Usage: $0 [-h host] [-p port] <playwright_report_zip_file>"
    echo "  -h host    Host to bind the HTTP server (default: 127.0.0.1)"
    echo "  -p port    Port to bind the HTTP server (default: 9876)"
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
python3 -m http.server --cgi -b "$HOST" "$PORT"

# Clean up
# rm -rf "$temp_dir"

