from nlp_pipeline import extract_tasks_from_file
import json

file_type = "text"
file_path = "test_files/meeting.txt"

try:
    tasks = extract_tasks_from_file(file_type, file_path)
    # Print formatted JSON in console
    print(json.dumps(tasks, indent=4))
except Exception as e:
    print("Error:", e)
