#!/bin/bash

# Read input from stdin
while IFS= read -r line; do
    [[ -z "$line" ]] && break  # Exit loop when an empty line is entered

    if [[ $line =~ Expected:\ \/home\/runner\/work\/helioviewer.org-tests\/helioviewer.org-tests\/(.+)$ ]]; then
        expected_file="${BASH_REMATCH[1]}"
    elif [[ $line =~ Received:\ (.+)$ ]]; then
        received_file="${BASH_REMATCH[1]}"
    elif [[ $line =~ (http:\/\/.+)$ ]]; then
        url_to_fetch="${BASH_REMATCH[1]}"
    fi
done

 #Check i fboth expected and received file paths were found
if [[ -s $expected_file && -n $url_to_fetch ]]; then
    wget ${url_to_fetch} -O $expected_file
else
    echo "FILE NOT FOUND: $expected_file"
    echo "URL TO FETCH: $url_to_fetch"
fi
