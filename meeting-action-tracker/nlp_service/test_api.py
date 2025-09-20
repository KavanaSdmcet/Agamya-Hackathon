import requests

# URL of your running NLP Flask API
url = "http://127.0.0.1:5000/extract-action-items"

# Test JSON data
data = {
    "file_type": "text",
    "file_path": "test_files/meeting.txt"
}

# Make POST request
response = requests.post(url, json=data)

# Print structured tasks
print(response.json())
