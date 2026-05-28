export const PROFILE_REPOSITORY_CONTRACT = {
  name: "ProfileRepository",
  methods: ["getProfile", "saveProfile", "updateProfile"]
};

export const SESSION_REPOSITORY_CONTRACT = {
  name: "SessionRepository",
  methods: ["getSession", "saveSession"]
};

export const MATCH_REPOSITORY_CONTRACT = {
  name: "MatchRepository",
  methods: ["getMatch", "saveMatch", "saveMatchResult"]
};

export const REWARD_CLAIM_REPOSITORY_CONTRACT = {
  name: "RewardClaimRepository",
  methods: ["getRewardClaim", "saveRewardClaim"]
};
