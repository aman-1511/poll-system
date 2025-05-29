const Poll = require('../models/Poll');

function initializeSocketHandlers(io, studentManager) {
  io.on('connection', (socket) => {
    // Student joins
    socket.on('student:joined', async ({ name }, callback) => {
      try {
        const student = await studentManager.addStudent(socket.id, name);
        const activePoll = studentManager.getActivePoll();
        
        // Notify all clients about new student
        io.emit('students:update', studentManager.getStudents());
        
        if (callback && typeof callback === 'function') {
          callback({
            name,
            pollStatus: activePoll ? 'active' : 'waiting',
            currentPoll: activePoll
          });
        }
      } catch (error) {
        console.error('Error handling student:joined:', error);
        if (callback && typeof callback === 'function') {
          callback({ error: error.message });
        }
      }
    });

    // Teacher joins
    socket.on('teacher:joined', ({ name }, callback) => {
      try {
        // Store teacher info if needed
        console.log(`Teacher joined: ${name}`);
        
        // Add teacher to a special room for broadcasting
        socket.join('teacher_room');
        
        const students = studentManager.getStudents();
        const activePoll = studentManager.getActivePoll();
        
        if (callback && typeof callback === 'function') {
          callback({
            name,
            students,
            pollStatus: activePoll ? 'active' : 'waiting',
            currentPoll: activePoll
          });
        }
        
        // If there's an active poll, send the current results to this teacher
        if (activePoll) {
          const results = generateResults(activePoll);
          socket.emit('poll:results', results);
          
          socket.emit('poll:progress', {
            total: students.length,
            answered: Object.keys(activePoll.answers).length
          });
        }
      } catch (error) {
        console.error('Error handling teacher:joined:', error);
        if (callback && typeof callback === 'function') {
          callback({ error: error.message });
        }
      }
    });

    // Teacher asks a question
    socket.on('question:ask', async ({ question, options, timeout }, callback) => {
      try {
        if (studentManager.getActivePoll()) {
          socket.emit('poll:error', 'A poll is already active');
          return callback && typeof callback === 'function' ? callback({ error: 'A poll is already active' }) : null;
        }

        const poll = await studentManager.startPoll(question, options, timeout);
        if (!poll) {
          return callback && typeof callback === 'function' ? callback({ error: 'Failed to create poll' }) : null;
        }
        
        io.emit('question:receive', { 
          id: poll.id,
          question, 
          options, 
          timeout,
          startTime: poll.startTime 
        });

        // Set timeout for poll
        setTimeout(() => {
          const currentPoll = studentManager.getActivePoll();
          if (currentPoll && currentPoll.id === poll.id) {
            console.log('Poll timed out:', poll.id);
            
            // Calculate final results
            const finalResults = generateResults(currentPoll);
            
            // Notify all clients that the poll has ended
            io.emit('poll:timeout', null);
            
            // Send final results to ALL clients, since the poll is now over
            io.emit('poll:results', finalResults);
            
            // End the poll in the manager
            studentManager.endPoll();
          }
        }, timeout * 1000);
        
        if (callback && typeof callback === 'function') {
          callback({ success: true, poll });
        }
      } catch (error) {
        console.error('Error handling question:ask:', error);
        if (callback && typeof callback === 'function') {
          callback({ error: error.message });
        }
      }
    });

    // Student submits answer
    socket.on('answer:submit', async ({ name, answer }, callback) => {
      try {
        const poll = studentManager.getActivePoll();
        if (!poll) {
          return callback && typeof callback === 'function' ? callback({ error: 'No active poll' }) : null;
        }

        // Check if answer is valid
        if (!poll.options.includes(answer)) {
          return callback && typeof callback === 'function' ? callback({ error: 'Invalid answer option' }) : null;
        }

        console.log(`Student ${name} submitted answer: ${answer}`);
        
        // Submit the answer
        await studentManager.submitAnswer(name, answer);
        
        // Create a personal result object that only shows this student's vote
        const personalResults = {};
        for (const opt of poll.options) {
          personalResults[opt] = opt === answer ? 1 : 0;
        }
        
        // Broadcast updated results to teachers and other students who already answered
        broadcastResults(io, studentManager);
        
        // If all students answered, end poll early
        if (studentManager.areAllAnswersSubmitted()) {
          console.log('All students have answered - ending poll early');
          
          // Calculate final results
          const finalResults = generateResults(poll);
          
          // Notify all clients that the poll has ended
          io.emit('poll:timeout', null);
          
          // Send final results to ALL clients
          io.emit('poll:results', finalResults);
          
          // End the poll
          await studentManager.endPoll();
        }
        
        if (callback && typeof callback === 'function') {
          callback({ 
            success: true,
            results: personalResults,
            message: 'Your answer has been submitted. Results will be available once all students have answered or when the timer expires.'
          });
        }
      } catch (error) {
        console.error('Error handling answer:submit:', error);
        if (callback && typeof callback === 'function') {
          callback({ error: error.message });
        }
      }
    });

    // Check if student has answered
    socket.on('check:answered', ({ name }, callback) => {
      try {
        const poll = studentManager.getActivePoll();
        
        if (!poll) {
          return callback && typeof callback === 'function' ? 
            callback({ hasAnswered: false, error: 'No active poll' }) : null;
        }
        
        const hasAnswered = poll.answers && poll.answers[name] !== undefined;
        
        if (callback && typeof callback === 'function') {
          callback({ hasAnswered });
        }
      } catch (error) {
        console.error('Error checking if student answered:', error);
        if (callback && typeof callback === 'function') {
          callback({ hasAnswered: false, error: error.message });
        }
      }
    });

    // Teacher kicks student
    socket.on('student:kick', async ({ name }, callback) => {
      try {
        const studentSocketId = await studentManager.kickStudent(name);
        if (studentSocketId) {
          // Notify the student they've been kicked
          io.to(studentSocketId).emit('student:kicked', { reason: 'Kicked by teacher' });
          
          // Update all clients about student list
          io.emit('students:update', studentManager.getStudents());
          
          if (callback && typeof callback === 'function') {
            callback({ success: true });
          }
        } else {
          if (callback && typeof callback === 'function') {
            callback({ error: 'Student not found' });
          }
        }
      } catch (error) {
        console.error('Error handling student:kick:', error);
        if (callback && typeof callback === 'function') {
          callback({ error: error.message });
        }
      }
    });

    // Get poll history
    socket.on('polls:history', async (_, callback) => {
      try {
        const pollHistory = await studentManager.getPollHistory();
        if (callback && typeof callback === 'function') {
          callback({ success: true, polls: pollHistory });
        }
      } catch (error) {
        console.error('Error handling polls:history:', error);
        if (callback && typeof callback === 'function') {
          callback({ error: error.message });
        }
      }
    });

    // Chat message
    socket.on('chat:message', ({ from, message, role }, callback) => {
      try {
        if (!from || !message || !role) {
          const error = 'Missing required chat message fields';
          console.error(error);
          return callback && typeof callback === 'function' ? callback({ error }) : null;
        }
        
        // Broadcast chat message to all connected clients
        io.emit('chat:message', { from, message, role, timestamp: Date.now() });
        
        if (callback && typeof callback === 'function') {
          callback({ success: true });
        }
      } catch (error) {
        console.error('Error handling chat message:', error);
        if (callback && typeof callback === 'function') {
          callback({ error: error.message });
        }
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      await studentManager.removeStudent(socket.id);
      // Notify remaining clients about updated student list
      io.emit('students:update', studentManager.getStudents());
    });
  });
}

function broadcastResults(io, studentManager) {
  const poll = studentManager.getActivePoll();
  if (!poll) return;

  console.log('Broadcasting poll results...');

  try {
    // Calculate counts for each option
    const counts = {};
    
    // Initialize counts for all options to ensure we have a complete result object
    for (const opt of poll.options) {
      counts[opt] = 0;
    }
    
    // Count answers for each option
    for (const ans of Object.values(poll.answers)) {
      if (typeof ans === 'string' && counts[ans] !== undefined) {
        counts[ans]++;
      }
    }
    
    // Get the total number of answers
    const totalAnswers = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const totalStudents = studentManager.getStudents().length;
    
    console.log('Poll results:', { counts, totalAnswers, totalStudents });
    
    // Send progress update to all clients
    io.emit('poll:progress', { 
      total: totalStudents,
      answered: totalAnswers
    });
    
    // For each client, check if they should receive results
    const students = studentManager.getStudents();
    students.forEach(student => {
      // Find the socket for this student
      const socketId = studentManager.getSocketIdByName(student.name);
      
      // Only send results to students who have already answered
      if (socketId && poll.answers[student.name] !== undefined) {
        io.to(socketId).emit('poll:results', counts);
      }
    });
    
    // Always send results to teachers (sockets not in the students map)
    io.to('teacher_room').emit('poll:results', counts);
  } catch (error) {
    console.error('Error broadcasting results:', error);
    // Only send empty results to teachers in case of error
    io.to('teacher_room').emit('poll:results', {});
    io.emit('poll:progress', { total: 0, answered: 0 });
  }
}

function generateResults(poll) {
  if (!poll) return {};
  
  // Calculate counts for each option
  const counts = {};
  
  // Initialize counts for all options
  for (const opt of poll.options) {
    counts[opt] = 0;
  }
  
  // Count answers
  for (const ans of Object.values(poll.answers)) {
    if (typeof ans === 'string' && counts[ans] !== undefined) {
      counts[ans]++;
    }
  }
  
  return counts;
}

module.exports = {
  initializeSocketHandlers
}; 