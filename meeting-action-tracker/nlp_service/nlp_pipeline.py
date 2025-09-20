import whisper # type: ignore
import spacy # type: ignore
from dateparser import parse as parse_date # type: ignore
import ffmpeg # type: ignore

nlp = spacy.load("en_core_web_sm")
whisper_model = whisper.load_model("base")

# Transcription
def transcribe_audio(file_path):
    result = whisper_model.transcribe(file_path)
    return result["text"]

def extract_audio_from_video(video_path, audio_path="temp_audio.wav"):
    (
        ffmpeg.input(video_path)
        .output(audio_path, ac=1, ar=16000)
        .run(overwrite_output=True)
    )
    return audio_path

# Sentence splitting
def split_sentences(text):
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents]

# Detect actionable sentences
def is_actionable(sentence):
    keywords = ["will", "must", "should", "to be done", "assign", "complete"]
    return any(word in sentence.lower() for word in keywords)

# Extract entities
def extract_who(sentence):
    doc = nlp(sentence)
    persons = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
    return persons if persons else ["Unknown"]

def extract_when(sentence):
    doc = nlp(sentence)
    dates = []
    for ent in doc.ents:
        if ent.label_ in ["DATE", "TIME"]:
            parsed = parse_date(ent.text)
            if parsed:
                dates.append(parsed)
    # If nothing found, try keywords like "next Friday"
    if not dates:
        parsed = parse_date(sentence)
        if parsed:
            dates.append(parsed)
    return dates if dates else []

def extract_what(sentence):
    return sentence

# Extract tasks from text
def extract_tasks_from_text(text, source="text"):
    sentences = split_sentences(text)
    tasks = []
    for sent in sentences:
        if is_actionable(sent):
            deadlines = extract_when(sent)
            # Convert datetime to YYYY-MM-DD string
            deadlines_str = [d.strftime("%Y-%m-%d") for d in deadlines] if deadlines else ["Not Specified"]

            assignees = extract_who(sent)
            assignees = assignees if assignees else ["Unknown"]

            tasks.append({
                "description": extract_what(sent),
                "assignee": assignees,
                "deadline": deadlines_str,
                "source": source,
                "confidence": 0.9
            })
    return tasks

# Extract tasks from file
def extract_tasks_from_file(file_type, file_path):
    text = ""
    if file_type == "audio":
        text = transcribe_audio(file_path)
    elif file_type == "video":
        audio_path = extract_audio_from_video(file_path)
        text = transcribe_audio(audio_path)
    elif file_type == "text":
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        raise ValueError("Unsupported file type")
    return extract_tasks_from_text(text, source=file_type)
