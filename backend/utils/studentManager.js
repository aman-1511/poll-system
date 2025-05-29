let Poll;
let Student;
let useDatabase = false;

try {
  Poll = require('../models/Poll');
  Student = require('../models/Student');
  useDatabase = true;
} catch (error) {
  console.warn('MongoDB models not available. Running in memory-only mode.');
}

class StudentManager {
  constructor() {
    this.students = new Map(); // socket.id -> { name }
    this.activePoll = null; // { question, options, timeout, answers: { [name]: answer }, startTime }
    this.polls = []; // Track poll history in memory
    this.activePollId = null; // MongoDB ID of the active poll
  }

  async addStudent(socketId, name) {
    try {
      let studentId = Date.now().toString();
      
      if (useDatabase) {
        // Check if student already exists in database
        let student = await Student.findOne({ name });
        
        if (student) {
          // Update socket ID if student exists
          student.socketId = socketId;
          student.isActive = true;
          student.lastSeen = Date.now();
          await student.save();
          studentId = student._id;
        } else {
          // Create new student
          student = await Student.create({ name, socketId });
          studentId = student._id;
        }
      }
      
      // Store in memory map
      this.students.set(socketId, { name, id: studentId });
      return { name, id: studentId };
    } catch (error) {
      console.error('Error adding student:', error);
      // Fallback to in-memory mode
      const studentId = Date.now().toString();
      this.students.set(socketId, { name, id: studentId });
      return { name, id: studentId };
    }
  }

  async removeStudent(socketId) {
    try {
      const student = this.students.get(socketId);
      if (student) {
        if (useDatabase) {
          // Update student status in database
          await Student.findOneAndUpdate(
            { socketId },
            { isActive: false, lastSeen: Date.now() }
          );
        }
        this.students.delete(socketId);
      }
    } catch (error) {
      console.error('Error removing student:', error);
      // Fallback to in-memory
      this.students.delete(socketId);
    }
  }

  async kickStudent(name) {
    try {
      // Find student by name
      const studentEntry = [...this.students.entries()].find(([_, s]) => s.name === name);
      if (studentEntry) {
        const [socketId] = studentEntry;
        if (useDatabase) {
          await Student.findOneAndUpdate(
            { name },
            { isActive: false, lastSeen: Date.now() }
          );
        }
        this.students.delete(socketId);
        return socketId;
      }
      return null;
    } catch (error) {
      console.error('Error kicking student:', error);
      // Fallback to in-memory
      const studentEntry = [...this.students.entries()].find(([_, s]) => s.name === name);
      if (studentEntry) {
        const [socketId] = studentEntry;
        this.students.delete(socketId);
        return socketId;
      }
      return null;
    }
  }

  getStudentCount() {
    return this.students.size;
  }

  getStudentBySocketId(socketId) {
    return this.students.get(socketId);
  }

  getStudentByName(name) {
    return [...this.students.values()].find(s => s.name === name);
  }

  getSocketIdByName(name) {
    const entry = [...this.students.entries()].find(([_, student]) => student.name === name);
    return entry ? entry[0] : null;
  }

  getStudents() {
    return [...this.students.values()];
  }

  getActivePoll() {
    return this.activePoll;
  }

  async startPoll(question, options, timeout) {
    try {
      const pollId = Date.now().toString();
      
      // Store in memory
      this.activePoll = {
        id: pollId,
        question,
        options,
        timeout,
        answers: {},
        startTime: Date.now()
      };
      
      if (useDatabase) {
        // Create new poll in database
        const poll = await Poll.create({
          question,
          options,
          timeout,
          startTime: Date.now(),
          status: 'active'
        });
        
        this.activePoll.id = poll._id;
        this.activePollId = poll._id;
      } else {
        this.activePollId = pollId;
      }
      
      return this.activePoll;
    } catch (error) {
      console.error('Error starting poll:', error);
      // Fallback to in-memory
      const pollId = Date.now().toString();
      this.activePoll = {
        id: pollId,
        question,
        options,
        timeout,
        answers: {},
        startTime: Date.now()
      };
      this.activePollId = pollId;
      return this.activePoll;
    }
  }

  async endPoll() {
    try {
      if (this.activePollId) {
        // Calculate results
        const counts = {};
        for (const opt of this.activePoll.options) {
          counts[opt] = 0;
        }
        
        for (const ans of Object.values(this.activePoll.answers)) {
          if (typeof ans === 'string' && counts[ans] !== undefined) {
            counts[ans]++;
          }
        }
        
        if (useDatabase) {
          // Update poll in database
          await Poll.findByIdAndUpdate(
            this.activePollId,
            {
              endTime: Date.now(),
              status: 'completed',
              answers: this.activePoll.answers,
              results: counts
            }
          );
        }
        
        // Store in memory history
        this.polls.push({...this.activePoll, results: counts, endTime: Date.now()});
        
        // Reset active poll
        this.activePoll = null;
        this.activePollId = null;
      }
    } catch (error) {
      console.error('Error ending poll:', error);
      // Fallback to in-memory
      if (this.activePoll) {
        const counts = {};
        for (const opt of this.activePoll.options) {
          counts[opt] = 0;
        }
        
        for (const ans of Object.values(this.activePoll.answers)) {
          if (typeof ans === 'string' && counts[ans] !== undefined) {
            counts[ans]++;
          }
        }
        
        this.polls.push({...this.activePoll, results: counts, endTime: Date.now()});
        this.activePoll = null;
        this.activePollId = null;
      }
    }
  }

  async submitAnswer(name, answer) {
    if (!this.activePoll) return false;
    
    this.activePoll.answers[name] = answer;
    
    try {
      if (useDatabase && this.activePollId) {
        // Update poll answers in database
        await Poll.findByIdAndUpdate(
          this.activePollId,
          { 
            $set: { [`answers.${name}`]: answer }
          }
        );
      }
      return true;
    } catch (error) {
      console.error('Error submitting answer:', error);
      return true; // Still return true since we updated in memory
    }
  }

  areAllAnswersSubmitted() {
    if (!this.activePoll) {
      return false;
    }
    
    const studentNames = [...this.students.values()].map(student => student.name);
    if (studentNames.length === 0) {
      return false;
    }
    
    // Check if all active students have submitted an answer
    for (const studentName of studentNames) {
      if (this.activePoll.answers[studentName] === undefined) {
        return false;
      }
    }
    
    return true;
  }

  async getPollHistory() {
    try {
      let polls = [];
      
      if (useDatabase) {
        // Get all completed polls from database
        polls = await Poll.find({ status: 'completed' })
          .sort({ endTime: -1 }) // Sort by end time descending (most recent first)
          .lean();
      } else {
        // Use in-memory polls
        polls = this.polls.sort((a, b) => b.endTime - a.endTime);
      }
      
      // Ensure all polls have the required fields
      const enrichedPolls = polls.map(poll => {
        // Make sure we have results for each poll
        if (!poll.results) {
          poll.results = {};
          // If we have answers but no results, calculate them
          if (poll.answers && poll.options) {
            for (const opt of poll.options) {
              poll.results[opt] = 0;
            }
            
            for (const ans of Object.values(poll.answers)) {
              if (typeof ans === 'string' && poll.results[ans] !== undefined) {
                poll.results[ans]++;
              }
            }
          }
        }
        
        // If options are missing, create a default array from results keys
        if (!poll.options && poll.results) {
          poll.options = Object.keys(poll.results);
        }
        
        // Ensure we have basic fields
        return {
          id: poll.id || poll._id || Date.now().toString(),
          question: poll.question || 'Unknown Question',
          options: poll.options || [],
          results: poll.results || {},
          answers: poll.answers || {},
          startTime: poll.startTime || 0,
          endTime: poll.endTime || Date.now(),
          ...poll
        };
      });
      
      console.log("Sending poll history:", enrichedPolls);
      return enrichedPolls;
    } catch (error) {
      console.error('Error getting poll history:', error);
      // Return an empty array on error
      return [];
    }
  }
}

function initializeStudentManager() {
  return new StudentManager();
}

module.exports = {
  initializeStudentManager
}; 