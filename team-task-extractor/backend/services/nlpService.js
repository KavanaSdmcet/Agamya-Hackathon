const nlp = require('compromise');
const natural = require('natural');

class NLPService {
    constructor() {
        this.actionWords = [
            'will', 'should', 'need to', 'have to', 'must', 'going to',
            'responsible for', 'assigned to', 'take care of', 'handle',
            'complete', 'finish', 'deliver', 'prepare', 'create', 'review'
        ];
        
        this.timeWords = [
            'today', 'tomorrow', 'next week', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday', 'sunday', 'by', 'before',
            'deadline', 'due', 'end of'
        ];
    }

    extractTasks(transcriptText, meetingId, meetingDate) {
        const tasks = [];
        const sentences = this.splitIntoSentences(transcriptText);
        
        sentences.forEach((sentence, index) => {
            const task = this.analyzeSentence(sentence, meetingId, meetingDate, index);
            if (task) {
                tasks.push(task);
            }
        });
        
        return tasks;
    }

    splitIntoSentences(text) {
        // Clean transcript text and split into sentences
        const cleanText = text.replace(/\[[\d:]+\]/g, '') // Remove timestamps
                             .replace(/\n+/g, ' ')           // Replace newlines
                             .replace(/\s+/g, ' ')           // Normalize spaces
                             .trim();
        
        return natural.SentenceTokenizer.tokenize(cleanText);
    }

    analyzeSentence(sentence, meetingId, meetingDate, sentenceIndex) {
        const doc = nlp(sentence);
        
        // Check if sentence contains action indicators
        const hasAction = this.actionWords.some(word => 
            sentence.toLowerCase().includes(word.toLowerCase())
        );
        
        if (!hasAction) return null;
        
        // Extract entities
        const people = this.extractPeople(doc);
        const dates = this.extractDates(doc, meetingDate);
        const taskDescription = this.extractTaskDescription(sentence);
        
        if (!taskDescription) return null;
        
        return {
            id: `task_${meetingId}_${sentenceIndex}`,
            meetingId: meetingId,
            description: taskDescription,
            assignee: people.length > 0 ? people[0] : 'Unassigned',
            deadline: dates.length > 0 ? dates[0] : null,
            status: 'pending',
            confidence: this.calculateConfidence(sentence),
            originalSentence: sentence,
            extractedAt: new Date().toISOString()
        };
    }

    extractPeople(doc) {
        const people = [];
        
        // Extract names using compromise
        const names = doc.people().out('array');
        people.push(...names);
        
        // Look for pronouns and common assignment patterns
        const pronouns = doc.match('(I|you|he|she|they|we)').out('array');
        people.push(...pronouns);
        
        return [...new Set(people)]; // Remove duplicates
    }

    extractDates(doc, meetingDate) {
        const dates = [];
        const dateEntities = doc.dates().out('array');
        
        dateEntities.forEach(dateStr => {
            const parsedDate = this.parseRelativeDate(dateStr, meetingDate);
            if (parsedDate) {
                dates.push(parsedDate);
            }
        });
        
        return dates;
    }

    parseRelativeDate(dateStr, baseDate) {
        const base = new Date(baseDate);
        const lower = dateStr.toLowerCase();
        
        if (lower.includes('today')) {
            return base.toISOString().split('T')[0];
        }
        
        if (lower.includes('tomorrow')) {
            const tomorrow = new Date(base);
            tomorrow.setDate(base.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }
        
        if (lower.includes('next week')) {
            const nextWeek = new Date(base);
            nextWeek.setDate(base.getDate() + 7);
            return nextWeek.toISOString().split('T')[0];
        }
        
        // Try to parse absolute dates
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }
        
        return null;
    }

    extractTaskDescription(sentence) {
        // Remove speaker names and timestamps
        let cleaned = sentence.replace(/^[A-Za-z\s]+:/, '').trim();
        
        // Extract the main action/task from the sentence
        const doc = nlp(cleaned);
        
        // Look for verb phrases that indicate tasks
        const verbs = doc.verbs().out('array');
        if (verbs.length === 0) return null;
        
        // Return a cleaned version of the sentence as task description
        return cleaned.length > 10 ? cleaned : null;
    }

    calculateConfidence(sentence) {
        let confidence = 0.5; // Base confidence
        
        // Higher confidence for explicit action words
        const strongActionWords = ['will', 'assigned', 'responsible', 'deadline'];
        if (strongActionWords.some(word => sentence.toLowerCase().includes(word))) {
            confidence += 0.3;
        }
        
        // Higher confidence if it mentions specific dates
        if (this.timeWords.some(word => sentence.toLowerCase().includes(word))) {
            confidence += 0.2;
        }
        
        return Math.min(confidence, 1.0);
    }
}

module.exports = NLPService;