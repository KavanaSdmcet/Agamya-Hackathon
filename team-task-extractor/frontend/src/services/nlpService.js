// Enhanced NLP service for better task extraction with timestamp and pronoun handling
class NLPService {
  constructor() {
    this.actionPatterns = [
      // "I will/I'll" patterns
      { 
        regex: /\bI\s+(?:will|'ll)\s+(.+?)(?:\s+by\s+(.+))?$/i,
        type: 'self_assignment',
        confidenceBoost: 0.3
      },
      // "I can/need to/have to" patterns  
      {
        regex: /\bI\s+(?:can|need to|have to|must)\s+(.+?)(?:\s+by\s+(.+))?$/i,
        type: 'self_assignment', 
        confidenceBoost: 0.2
      },
      // Direct name assignment: "Bob will/should"
      {
        regex: /(\w+)\s+(?:will|should|needs?\s+to|has\s+to)\s+(.+?)(?:\s+by\s+(.+))?$/i,
        type: 'direct_assignment',
        confidenceBoost: 0.3
      },
      // "We should/need to" patterns
      {
        regex: /\b(?:we|let's)\s+(?:should|need to|have to|must)?\s*(.+?)(?:\s+by\s+(.+))?$/i,
        type: 'team_assignment',
        confidenceBoost: 0.1
      },
      // Responsibility patterns
      {
        regex: /(\w+)\s+(?:is responsible for|will handle|is assigned to)\s+(.+?)(?:\s+by\s+(.+))?$/i,
        type: 'responsibility_assignment',
        confidenceBoost: 0.4
      }
    ];

    this.timeIndicators = {
      'today': 0,
      'tomorrow': 1,
      'next week': 7,
      'this week': 5,
      'end of week': 5,
      'end of this week': 5,
      'end of month': 30
    };
  }

  extractTasksFromTranscript(transcriptText, meetingTitle = 'Meeting') {
    const parsedLines = this.parseTranscriptWithTimestamps(transcriptText);
    const speakers = this.extractSpeakers(parsedLines);
    const tasks = [];
    let taskId = 1;

    const context = this.buildSpeakerContext(parsedLines);

    parsedLines.forEach(line => {
      if (line.speaker && line.content) {
        const extracted = this.extractTasksFromLine(
          line,
          speakers,
          context,
          meetingTitle,
          taskId
        );
        tasks.push(...extracted);
        taskId += extracted.length;
      }
    });

    return { 
      tasks: this.resolveTeamAssignments(tasks, speakers), 
      speakers: Array.from(speakers),
      summary: this.generateSummary(tasks),
      timeline: this.extractTimeline(parsedLines)
    };
  }

  // ----------------------------
  // Transcript Parsing
  // ----------------------------
  parseTranscriptWithTimestamps(transcriptText) {
    return transcriptText
      .split('\n')
      .filter(l => l.trim())
      .map(line => {
        const timestampMatch = line.match(/^\[(.*?)\]\s*(.+)$/);
        let timestamp = null, rest = line;
        if (timestampMatch) {
          timestamp = timestampMatch[1];
          rest = timestampMatch[2];
        }
        const speakerMatch = rest.match(/^([^:]+):\s*(.+)$/);
        if (speakerMatch) {
          return {
            timestamp,
            speaker: speakerMatch[1].trim(),
            content: speakerMatch[2].trim()
          };
        }
        return { timestamp, speaker: null, content: rest.trim() };
      });
  }

  extractSpeakers(parsedLines) {
    const speakers = new Set();
    parsedLines.forEach(l => l.speaker && speakers.add(l.speaker));
    return speakers;
  }

  buildSpeakerContext(parsedLines) {
    return {
      lastSpeaker: parsedLines.length ? parsedLines[parsedLines.length - 1].speaker : null
    };
  }

  // ----------------------------
  // Task Extraction
  // ----------------------------
  extractTasksFromLine(line, allSpeakers, context, meetingTitle, startId) {
    const tasks = [];
    const content = line.content;
    const currentSpeaker = line.speaker;

    this.actionPatterns.forEach(pattern => {
      const match = content.match(pattern.regex);
      if (match) {
        let assignee = 'Unassigned';
        let taskDescription = '';
        let deadline = null;
        let confidence = 0.5;

        // Inside extractTasksFromLine, update assignee assignment for all patterns:
        switch (pattern.type) {
        case 'self_assignment':
            // "I will ..." → always assign to speaker
            assignee = currentSpeaker;
            taskDescription = match[1];
            deadline = match[2];
            confidence += pattern.confidenceBoost;
            break;

        case 'direct_assignment':
            const mentionedPerson = match[1];
            if (mentionedPerson.toLowerCase() === 'i') {
            assignee = currentSpeaker; // <-- handle "I"
            } else if (mentionedPerson.toLowerCase() === 'you') {
            assignee = this.resolveYouPronoun(currentSpeaker, allSpeakers);
            } else if (allSpeakers.has(mentionedPerson)) {
            assignee = mentionedPerson;
            } else {
            assignee = mentionedPerson;
            }
            taskDescription = match[2];
            deadline = match[3];
            confidence += pattern.confidenceBoost;
            break;

        case 'team_assignment':
            assignee = 'Team';
            taskDescription = match[1];
            deadline = match[2];
            confidence += pattern.confidenceBoost;
            break;

        case 'responsibility_assignment':
            assignee = match[1].toLowerCase() === 'i' ? currentSpeaker : match[1]; // <-- already handled
            taskDescription = match[2];
            deadline = match[3];
            confidence += pattern.confidenceBoost;
            break;
        }


        taskDescription = this.cleanTaskDescription(taskDescription);

        if (taskDescription && taskDescription.length > 5) {
          tasks.push({
            id: `task_${startId + tasks.length}`,
            meetingTitle,
            description: taskDescription,
            assignee,
            deadline: this.parseDeadline(deadline),
            status: 'pending',
            confidence: Math.min(confidence, 1),
            originalSentence: content,
            speaker: currentSpeaker,
            timestamp: line.timestamp,
            extractedAt: new Date().toISOString(),
            type: pattern.type
          });
        }
      }
    });

    return tasks;
  }

  cleanTaskDescription(desc) {
    return desc ? desc.replace(/^(also|just|really|actually)\s+/i, '').trim() : '';
  }

  resolveTeamAssignments(tasks, speakers) {
    return tasks.map(task => {
      if (task.type === 'team_assignment') {
        const members = Array.from(speakers);
        if (members.length === 2) {
          task.assignee = `${members[0]} & ${members[1]}`;
        } else if (members.length > 2 && members.length <= 5) {
          task.assignee = `Team (${members.join(', ')})`;
        } else {
          task.assignee = 'Team';
        }
      }
      return task;
    });
  }

  // ----------------------------
  // Pronoun Handling
  // ----------------------------
  resolveYouPronoun(currentSpeaker, allSpeakers) {
    const members = Array.from(allSpeakers);
    if (members.length === 2) {
      return members.find(s => s !== currentSpeaker) || 'Unassigned';
    }
    return 'Unassigned';
  }

  // ----------------------------
  // Deadlines
  // ----------------------------
  // ----------------------------
// Deadlines
// ----------------------------
parseDeadline(text) {
  if (!text) return null;

  const today = new Date();
  let lower = text.toLowerCase().trim();

  // Predefined simple time indicators
  if (this.timeIndicators[lower] !== undefined) {
    const d = new Date(today);
    d.setDate(today.getDate() + this.timeIndicators[lower]);
    return d.toISOString().split('T')[0];
  }

  // Handle dynamic weekdays: "next Monday", "this Friday"
  const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const weekdayMatch = lower.match(/(next|this)?\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
  
  if (weekdayMatch) {
    const modifier = weekdayMatch[1]; // "next" or "this" or undefined
    const dayName = weekdayMatch[2];
    const dayIndex = weekdays.indexOf(dayName);

    let targetDate = new Date(today);
    const currentDayIndex = today.getDay(); // 0=Sunday, 1=Monday...

    let diff = dayIndex - currentDayIndex;

    if (modifier === 'next') {
      diff += diff <= 0 ? 7 : 0; // next week
    } else if (modifier === 'this') {
      diff += diff < 0 ? 7 : 0; // this week but future
    } else {
      // no modifier, assume next occurrence
      diff += diff < 0 ? 7 : 0;
    }

    targetDate.setDate(today.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  }

  // If nothing matched, return the original text
  return text;
}


  // ----------------------------
  // Summary & Timeline
  // ----------------------------
  generateSummary(tasks) {
    return {
      totalTasks: tasks.length,
      assignedTasks: tasks.filter(t => t.assignee !== 'Unassigned').length,
      tasksWithDeadlines: tasks.filter(t => t.deadline).length
    };
  }

  extractTimeline(parsedLines) {
    return parsedLines.map(l => ({
      timestamp: l.timestamp,
      speaker: l.speaker,
      content: l.content
    }));
  }
}

export default NLPService;
