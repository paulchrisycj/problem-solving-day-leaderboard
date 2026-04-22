import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import {
  loadState,
  createIndividual,
  createGroup,
  updateParticipant,
  deleteParticipant,
  submitScore,
  updateTimer,
  resetTimer,
} from './lib/data';
import { datetimeLocalToGMT8ISO } from './lib/timezone';
import {
  validateIndividual,
  validateGroup,
  validateScore,
  validateTimer,
  validateParticipantUpdate,
} from './lib/validation';
import { SocketEvents } from './types';
import type {
  Individual,
  Group,
  Participant,
  TimerState,
  AppState,
  IndividualFormData,
  GroupFormData,
  ScoreFormData,
} from './types';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Helper to calculate leaderboard entries
function calculateLeaderboard(participants: (Individual | Group)[]) {
  const withScores = participants
    .filter((p) => p.score !== null)
    .sort((a, b) => {
      // Primary: score descending
      if (b.score !== a.score) return b.score! - a.score!;
      // Secondary: timestamp ascending (earlier wins)
      return (
        new Date(a.bestScoreTimestamp!).getTime() -
        new Date(b.bestScoreTimestamp!).getTime()
      );
    })
    .map((p, index) => ({ ...p, rank: index + 1 }));

  const withoutScores = participants
    .filter((p) => p.score === null)
    .map((p) => ({ ...p, rank: 0 }));

  return [...withScores, ...withoutScores];
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Broadcast state to all clients
  async function broadcastState() {
    const state = await loadState();
    const individuals = calculateLeaderboard(state.individuals);
    const groups = calculateLeaderboard(state.groups);

    io.emit(SocketEvents.LEADERBOARD_UPDATE, { individuals, groups });
  }

  // Broadcast timer to all clients
  async function broadcastTimer() {
    const state = await loadState();
    io.emit(SocketEvents.TIMER_UPDATE, state.timer);
  }

  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial state on connection
    const state = await loadState();
    const individuals = calculateLeaderboard(state.individuals);
    const groups = calculateLeaderboard(state.groups);

    socket.emit(SocketEvents.STATE_UPDATE, {
      state: {
        individuals: state.individuals,
        groups: state.groups,
        timer: state.timer,
      },
    });
    socket.emit(SocketEvents.LEADERBOARD_UPDATE, { individuals, groups });
    socket.emit(SocketEvents.TIMER_UPDATE, state.timer);

    // Handle state request
    socket.on(SocketEvents.REQUEST_STATE, async () => {
      const currentState = await loadState();
      const indLeaderboard = calculateLeaderboard(currentState.individuals);
      const grpLeaderboard = calculateLeaderboard(currentState.groups);

      socket.emit(SocketEvents.STATE_UPDATE, {
        state: {
          individuals: currentState.individuals,
          groups: currentState.groups,
          timer: currentState.timer,
        },
      });
      socket.emit(SocketEvents.LEADERBOARD_UPDATE, {
        individuals: indLeaderboard,
        groups: grpLeaderboard,
      });
    });

    // Handle participant creation
    socket.on(
      SocketEvents.PARTICIPANT_CREATE,
      async (data: { type: 'individual' | 'group' } & (IndividualFormData | GroupFormData)) => {
        try {
          let participant: Participant;

          if (data.type === 'individual') {
            const validation = validateIndividual(data);
            if (!validation.success) {
              socket.emit('error', { message: validation.error.issues[0].message });
              return;
            }
            participant = await createIndividual(validation.data.name);
          } else {
            const validation = validateGroup(data);
            if (!validation.success) {
              socket.emit('error', { message: validation.error.issues[0].message });
              return;
            }
            const groupData = data as GroupFormData & { type: 'group' };
            participant = await createGroup(validation.data.name, groupData.members);
          }

          io.emit(SocketEvents.PARTICIPANT_ADDED, { participant });
          await broadcastState();
        } catch (error) {
          console.error('Error creating participant:', error);
          socket.emit('error', { message: 'Failed to create participant' });
        }
      }
    );

    // Handle participant update
    socket.on(
      SocketEvents.PARTICIPANT_UPDATE,
      async (data: { id: string; name?: string; members?: string[] }) => {
        try {
          const validation = validateParticipantUpdate(data);
          if (!validation.success) {
            socket.emit('error', { message: validation.error.issues[0].message });
            return;
          }

          const participant = await updateParticipant(data.id, validation.data);
          if (!participant) {
            socket.emit('error', { message: 'Participant not found' });
            return;
          }

          io.emit(SocketEvents.PARTICIPANT_UPDATED, { participant });
          await broadcastState();
        } catch (error) {
          console.error('Error updating participant:', error);
          socket.emit('error', { message: 'Failed to update participant' });
        }
      }
    );

    // Handle participant deletion
    socket.on(
      SocketEvents.PARTICIPANT_DELETE,
      async (data: { id: string; type: 'individual' | 'group' }) => {
        try {
          const result = await deleteParticipant(data.id);
          if (!result.deleted) {
            socket.emit('error', { message: 'Participant not found' });
            return;
          }

          io.emit(SocketEvents.PARTICIPANT_DELETED, { id: data.id, type: data.type });
          await broadcastState();
        } catch (error) {
          console.error('Error deleting participant:', error);
          socket.emit('error', { message: 'Failed to delete participant' });
        }
      }
    );

    // Handle score submission
    socket.on(SocketEvents.SCORE_SUBMIT, async (data: ScoreFormData) => {
      try {
        const validation = validateScore(data);
        if (!validation.success) {
          socket.emit('error', { message: validation.error.issues[0].message });
          return;
        }

        const { participantId, participantType, testCasesPassed } = validation.data;

        const totalCases = participantType === 'individual'
          ? parseInt(process.env.NEXT_PUBLIC_INDVIDUAL_TEST_CASES || '40', 10)
          : parseInt(process.env.NEXT_PUBLIC_GROUP_TEST_CASES || '15', 10);

        const totalScore = participantType === 'individual'
          ? parseFloat(process.env.NEXT_PUBLIC_INDIVIDUAL_TOTAL_SCORE || '10')
          : parseFloat(process.env.NEXT_PUBLIC_GROUP_TOTAL_SCORE || '15');

        if (testCasesPassed > totalCases) {
          socket.emit('error', { message: `Test cases passed cannot exceed ${totalCases}` });
          return;
        }

        const score = totalCases > 0
          ? parseFloat(((testCasesPassed / totalCases) * totalScore).toFixed(4))
          : 0;

        const result = await submitScore(
          participantId,
          participantType,
          score,
          testCasesPassed
        );

        if (!result.success) {
          socket.emit('error', { message: result.error });
          return;
        }

        io.emit(SocketEvents.SCORE_UPDATED, { participant: result.participant });
        await broadcastState();
      } catch (error) {
        console.error('Error submitting score:', error);
        socket.emit('error', { message: 'Failed to submit score' });
      }
    });

    // Handle timer set
    socket.on(SocketEvents.TIMER_SET, async (data: { endTime: string }) => {
      try {
        const validation = validateTimer(data);
        if (!validation.success) {
          socket.emit('error', { message: validation.error.issues[0].message });
          return;
        }

        const endTimeISO = datetimeLocalToGMT8ISO(validation.data.endTime);
        await updateTimer({ endTime: endTimeISO, isRunning: false });
        await broadcastTimer();
      } catch (error) {
        console.error('Error setting timer:', error);
        socket.emit('error', { message: 'Failed to set timer' });
      }
    });

    // Handle timer start
    socket.on(SocketEvents.TIMER_START, async () => {
      try {
        const currentTimer = await loadState().then((s) => s.timer);
        if (!currentTimer.endTime) {
          socket.emit('error', { message: 'End time must be set before starting' });
          return;
        }
        await updateTimer({ isRunning: true });
        await broadcastTimer();
      } catch (error) {
        console.error('Error starting timer:', error);
        socket.emit('error', { message: 'Failed to start timer' });
      }
    });

    // Handle timer stop
    socket.on(SocketEvents.TIMER_STOP, async () => {
      try {
        await updateTimer({ isRunning: false });
        await broadcastTimer();
      } catch (error) {
        console.error('Error stopping timer:', error);
        socket.emit('error', { message: 'Failed to stop timer' });
      }
    });

    // Handle timer reset
    socket.on(SocketEvents.TIMER_RESET, async () => {
      try {
        await resetTimer();
        await broadcastTimer();
      } catch (error) {
        console.error('Error resetting timer:', error);
        socket.emit('error', { message: 'Failed to reset timer' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
