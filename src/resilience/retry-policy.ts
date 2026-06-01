export const STANDARD_JOB_RETRY = {
  attempts: 5,
  backoff: {
    type: 'exponential' as const,
    delay: 5000,
  },
  removeOnComplete: 500,
  removeOnFail: 500,
};
