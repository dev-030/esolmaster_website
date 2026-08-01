import json

log_file = "/Users/jamil/.gemini/antigravity/brain/7c92cdd2-e5a1-4272-b8da-81403f973bbc/.system_generated/logs/transcript_full.jsonl"

file_content_lines = {}
max_lines = 0

with open(log_file, "r") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("type") == "TOOL_RESPONSE":
                content = data.get("content", "")
                if "File Path: `file:///Users/jamil/Desktop/esolmaster/esolmaster_website/src/webcomponents/teacher/my-task/MyTask.tsx`" in content:
                    lines = content.split('\n')
                    for l in lines:
                        if ':' in l:
                            parts = l.split(':', 1)
                            if parts[0].isdigit():
                                line_num = int(parts[0])
                                line_text = parts[1][1:] if parts[1].startswith(' ') else parts[1]
                                file_content_lines[line_num] = line_text
                                if line_num > max_lines:
                                    max_lines = line_num
        except:
            pass

if max_lines > 0:
    with open("recovered_MyTask.tsx", "w") as out:
        for i in range(1, max_lines + 1):
            out.write(file_content_lines.get(i, f"// MISSING LINE {i}") + "\n")
    print(f"Recovered up to line {max_lines}")
else:
    print("Could not find file contents in transcript")
