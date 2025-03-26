#!/bin/zsh

# Function to create file with path comment
create_file_with_comment() {
  local filepath=$1
  local dir=$(dirname "$filepath")
  
  # Create directory if it doesn't exist
  mkdir -p "$dir"
  
  # Create file with path comment as first line
  echo "//$filepath" > "$filepath"
  
  echo "Created $filepath"
}

# Create route pages
create_file_with_comment "src/app/dashboard/page.tsx"
create_file_with_comment "src/app/job-family/[id]/page.tsx"
create_file_with_comment "src/app/career-path/page.tsx"
create_file_with_comment "src/app/profile/page.tsx"

# Create layout components
create_file_with_comment "src/app/_components/layout/Navbar.tsx"
create_file_with_comment "src/app/_components/layout/Sidebar.tsx"

# Create metro-map components
create_file_with_comment "src/app/_components/metro-map/MetroMap.tsx"
create_file_with_comment "src/app/_components/metro-map/Station.tsx"
create_file_with_comment "src/app/_components/metro-map/MetroLine.tsx"
create_file_with_comment "src/app/_components/metro-map/CareerPathView.tsx"

# Create job-family components
create_file_with_comment "src/app/_components/job-family/JobFamilyCard.tsx"
create_file_with_comment "src/app/_components/job-family/CompetencesList.tsx"
create_file_with_comment "src/app/_components/job-family/AccountabilitiesList.tsx"

# Create competence components
create_file_with_comment "src/app/_components/competence/CompetenceCard.tsx"
create_file_with_comment "src/app/_components/competence/DevelopmentActivities.tsx"

# Create development components
create_file_with_comment "src/app/_components/development/DevelopmentPlan.tsx"
create_file_with_comment "src/app/_components/development/QuarterlyGoals.tsx"

# Create UI components
create_file_with_comment "src/app/_components/ui/Button.tsx"
create_file_with_comment "src/app/_components/ui/Card.tsx"
create_file_with_comment "src/app/_components/ui/Modal.tsx"
create_file_with_comment "src/app/_components/ui/Tooltip.tsx"

# Create lib constants
create_file_with_comment "src/lib/constants/jobFamilies.ts"
create_file_with_comment "src/lib/constants/competences.ts"
create_file_with_comment "src/lib/constants/developmentActivities.ts"

# Create type definitions
create_file_with_comment "src/lib/types/JobFamily.ts"
create_file_with_comment "src/lib/types/Competence.ts"
create_file_with_comment "src/lib/types/DevelopmentActivity.ts"
create_file_with_comment "src/lib/types/CareerPath.ts"
create_file_with_comment "src/lib/types/UserProfile.ts"

# Create hooks
create_file_with_comment "src/hooks/useCareerPath.ts"
create_file_with_comment "src/hooks/useCompetenceGap.ts"

echo "All files created successfully!"