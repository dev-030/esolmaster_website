const fs = require('fs');
const file = 'src/webcomponents/teacher/assign-task/ActivityBuilder.tsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = "const QuestionCard = React.memo(({ q, index, dragHandleProps, updateQuestion, removeQuestion }: any) => {";
const endMarker = "});\n\n  if (isLoadingTask) {";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries.");
  process.exit(1);
}

// Extract QuestionCard
const extractEndIndex = endIndex + 3; // include "});"
const questionCardCode = content.substring(startIndex, extractEndIndex);

// Remove QuestionCard from original position
let newContent = content.substring(0, startIndex) + content.substring(extractEndIndex);

// Insert QuestionCard before export default function ActivityBuilder
const insertMarker = "export default function ActivityBuilder() {";
const insertIndex = newContent.indexOf(insertMarker);

if (insertIndex === -1) {
  console.log("Could not find insert marker.");
  process.exit(1);
}

newContent = newContent.substring(0, insertIndex) + questionCardCode + "\n\n" + newContent.substring(insertIndex);

fs.writeFileSync(file, newContent, 'utf8');
console.log("Successfully moved QuestionCard!");
