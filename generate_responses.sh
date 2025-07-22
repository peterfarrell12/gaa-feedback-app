#!/bin/bash

# Form ID
FORM_ID="1411cbe8-da9a-42a1-88b3-ece6c95477e4"

# Question IDs
PERF_RATING="d3ab0579-a173-4f0c-a654-53e6af468163"
BEST_MOMENT="3a1fccd0-fda5-45e1-9ca1-e9028f56a69f"
PREPARED="9658e5a8-8bf9-42ad-9f1b-a2eca3dc524a"
TEAM_COMM="037e128d-ce99-45c1-a11f-5ccbbc8336ad"
IMPROVEMENT="a5eddbd7-15c1-4522-bacb-a59d2345c36c"

# Arrays of sample responses
PERFORMANCE_RATINGS=(6 7 8 9 7 8 6 9 8 7 8 9 7 6 8)
TEAM_COMM_RATINGS=(8 7 6 8 9 7 8 6 7 8 9 7 8 6 7)
BEST_MOMENTS=(
  "Scored the winning goal"
  "Great pass in midfield"
  "Solid defensive work"
  "Good teamwork with striker"
  "Intercepted key pass"
  "Created chance for teammate"
  "Strong tackle in defense"
  "Good communication on field"
  "Helped organize defense"
  "Made crucial save"
  "Set up counter attack"
  "Won important header"
  "Tracked back to help defense"
  "Good first touch under pressure"
  "Stayed calm in final minutes"
)
PREPARED_RESPONSES=("yes" "yes" "no" "yes" "yes" "yes" "no" "yes" "yes" "no" "yes" "yes" "yes" "no" "yes")
IMPROVEMENT_AREAS=("Defense" "Attack" "Midfield" "Set Pieces" "Communication" "Defense" "Attack" "Midfield" "Set Pieces" "Communication" "Defense" "Attack" "Communication" "Set Pieces" "Midfield")

# Generate 15 responses
for i in {0..14}; do
  echo "Creating response $((i+1))..."
  
  curl -s -X POST "http://localhost:3009/api/responses/submit" \
    -H "Content-Type: application/json" \
    -d "{
      \"formId\": \"$FORM_ID\",
      \"isAnonymous\": true,
      \"completionTimeSeconds\": $((120 + RANDOM % 240)),
      \"responses\": {
        \"$PERF_RATING\": ${PERFORMANCE_RATINGS[$i]},
        \"$BEST_MOMENT\": \"${BEST_MOMENTS[$i]}\",
        \"$PREPARED\": \"${PREPARED_RESPONSES[$i]}\",
        \"$TEAM_COMM\": ${TEAM_COMM_RATINGS[$i]},
        \"$IMPROVEMENT\": \"${IMPROVEMENT_AREAS[$i]}\"
      }
    }" > /dev/null
  
  if [ $? -eq 0 ]; then
    echo "Response $((i+1)) submitted successfully"
  else
    echo "Failed to submit response $((i+1))"
  fi
  
  sleep 0.5
done

echo "All responses submitted!"