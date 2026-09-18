const fs = require('fs');
const path = require('path');

const blueHexes = [
  '\\[#3454FB\\]', '\\[#3454fb\\]',
  '\\[#2842D8\\]', '\\[#2842d8\\]',
  '\\[#2F7EDA\\]', '\\[#2f7eda\\]',
  '\\[#2B44C9\\]', '\\[#2b44c9\\]',
  'blue-500', 'blue-600', 'blue-700', 'blue-800'
];

const allBlues = blueHexes.join('|');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Hover states first
  let hoverRegex = new RegExp(`hover:(bg|text|border|ring)-(${allBlues})`, 'gi');
  content = content.replace(hoverRegex, 'hover:$1-primary/90');

  // Focus states
  let focusRegex = new RegExp(`focus:(ring|border)-(${allBlues})`, 'gi');
  content = content.replace(focusRegex, 'focus:$1-primary');

  // Regular prefixes
  let standardRegex = new RegExp(`(bg|text|border|ring|fill|stroke|from|to|via)-(${allBlues})`, 'gi');
  content = content.replace(standardRegex, '$1-primary');

  // Bare hex colors
  content = content.replace(/"#3454FB"/gi, '"#2563EB"');
  content = content.replace(/"#2842D8"/gi, '"#2563EB"');
  content = content.replace(/'#3454FB'/gi, "'#2563EB'");
  content = content.replace(/'#2842D8'/gi, "'#2563EB'");

  // Fix up specific sidebaar breakage (or standard light blues)
  // We want to translate bg-blue-50/X to bg-primary/10
  content = content.replace(/bg-blue-50\/[0-9]+/gi, 'bg-primary/10');
  
  content = content.replace(/bg-blue-50(?![\/\w])/g, 'bg-primary/5');
  content = content.replace(/bg-blue-100(?![\/\w])/g, 'bg-primary/10');
  content = content.replace(/bg-blue-200(?![\/\w])/g, 'bg-primary/20');
  content = content.replace(/bg-blue-300(?![\/\w])/g, 'bg-primary/30');
  content = content.replace(/bg-blue-400(?![\/\w])/g, 'bg-primary/40');
  
  content = content.replace(/text-blue-50(?![\/\w])/g, 'text-primary/5');
  content = content.replace(/text-blue-100(?![\/\w])/g, 'text-primary/10');
  content = content.replace(/text-blue-200(?![\/\w])/g, 'text-primary/20');
  content = content.replace(/text-blue-300(?![\/\w])/g, 'text-primary/30');
  content = content.replace(/text-blue-400(?![\/\w])/g, 'text-primary/40');
  
  content = content.replace(/border-blue-100(?![\/\w])/g, 'border-primary/10');
  content = content.replace(/border-blue-200(?![\/\w])/g, 'border-primary/20');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walk('./src');
console.log('Color replacement complete.');
