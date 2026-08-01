const fs = require('fs');

const logPath = '/Users/jamil/.gemini/antigravity/brain/7c92cdd2-e5a1-4272-b8da-81403f973bbc/.system_generated/logs/transcript_full.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

let latestLines = {};
let maxLineNum = 0;

for (let line of lines) {
    if (!line) continue;
    try {
        const data = JSON.parse(line);
        if (data.type === 'TOOL_RESPONSE' && data.content && data.content.includes('MyTask.tsx')) {
            const outputLines = data.content.split('\n');
            let isFileView = false;
            for (let outLine of outputLines) {
                if (outLine.includes('File Path: `file:///')) isFileView = true;
                if (!isFileView) continue;
                const match = outLine.match(/^(\d+):\s(.*)/);
                if (match) {
                    const num = parseInt(match[1]);
                    const text = match[2];
                    latestLines[num] = text;
                    if (num > maxLineNum) maxLineNum = num;
                }
            }
        }
    } catch(e) {}
}

if (maxLineNum > 0) {
    let out = [];
    for (let i = 1; i <= maxLineNum; i++) {
        out.push(latestLines[i] !== undefined ? latestLines[i] : `// MISSING LINE ${i}`);
    }
    fs.writeFileSync('recovered_MyTask.tsx', out.join('\n'));
    console.log('Recovered up to line ' + maxLineNum);
} else {
    console.log('Not found');
}
