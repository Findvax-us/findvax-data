#!/usr/bin/env bash

if [ -z "$AWSENV_CF_DISTRIBUTION" ]; then 
  echo "AWSENV_CF_DISTRIBUTION is not set, cannot continue." >&2
  exit 1
fi


for STATE in `cat states.json | jq -r '.[].short'`
do
  LOCATIONS="$STATE/locations.json"
  if [[ -f $LOCATIONS ]];then
    COUNT=`cat $LOCATIONS | jq '. | length'`
  else
    COUNT=0
  fi

  OUTPUT=`cat states.json | jq '(.[]|select(.short == $state)?) += {count: $newCount}' --argjson newCount "$COUNT" --arg state "$STATE"`
  echo $OUTPUT > states.json
done


aws s3 sync ./ s3://findvax-data\
 --profile findvax\
 --delete\
 --exclude "*"\
 --include "states.json"\
 --include "*/locations.json"\
 --cache-control "public; max-age=120; must-revalidate"\
 --output json

aws s3 sync ./ s3://findvax-data\
 --profile findvax\
 --delete\
 --exclude "*"\
 --include "*/zipcodes.json"\
 --cache-control "public; max-age=31536000; must-revalidate"\
 --output json

aws s3 sync ./ s3://findvax-data\
 --profile findvax\
 --delete\
 --exclude "*"\
 --include "index.html"\
 --cache-control "public; max-age=31536000; immutable"\
 --output json

 aws cloudfront create-invalidation\
 --profile findvax\
  --distribution-id=$AWSENV_CF_DISTRIBUTION\
  --paths /\*\
  --output json\
  | jq -r '.Invalidation'