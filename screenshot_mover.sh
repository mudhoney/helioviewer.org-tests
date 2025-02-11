#!/bin/bash

# Read input from stdin
while IFS= read -r line; do

    [[ -z "$line" ]] && break  # Exit loop when an empty line is entered

    if [[ $line =~ Expected:\ (.+)$ ]]; then
        expected_file="${BASH_REMATCH[1]}"
    elif [[ $line =~ Received:\ (.+)$ ]]; then
        received_file="${BASH_REMATCH[1]}"
    fi
done

# Check if both expected and received file paths were found
if [[ -n $expected_file && -n $received_file ]]; then
    echo "mv \"$received_file\" \"$expected_file\""
    mv $received_file $expected_file
else
    echo "NOT FOUND \"$received_file\" \"$expected_file\""
fi
