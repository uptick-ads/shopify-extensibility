#!/bin/bash

# CalVer version generator: YYYY.M.D+N
# Get the latest tag on the main branch
latest_tag=$(git describe --tags --abbrev=0 main 2>/dev/null)

# Extract date components from the latest tag
if [[ $latest_tag =~ ([0-9]{2,4})\.([0-9]{1,2})\.([0-9]{1,2})\+([0-9]{1,2}) ]]; then
  last_year=${BASH_REMATCH[1]}
  last_month=${BASH_REMATCH[2]}
  last_day=${BASH_REMATCH[3]}
  last_release=${BASH_REMATCH[4]}
else
  last_year=$(date +%Y)
  last_month=$(date +%-m)
  last_day=$(date +%-d)
  last_release="00"
fi

# Get today's date (no leading zeros)
today_year=$(date +%Y)
today_month=$(date +%-m)
today_day=$(date +%-d)

# Determine next version
if [ "$last_year" = "$today_year" ] && \
   [ "$last_month" = "$today_month" ] && \
   [ "$last_day" = "$today_day" ]; then
  next_release=$(printf "%d" $((10#$last_release + 1)))
else
  next_release="1"
fi

echo "$today_year.$today_month.$today_day+$next_release"
