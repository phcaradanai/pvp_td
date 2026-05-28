function clone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

function createStore(entries = {}, idField) {
  const store = new Map();

  for (const [key, value] of Object.entries(entries || {})) {
    store.set(key, clone(value));
  }

  return {
    get(id) {
      return store.has(id) ? clone(store.get(id)) : null;
    },
    save(entity) {
      const saved = clone(entity);
      store.set(saved[idField], saved);
      return clone(saved);
    },
    update(id, patch) {
      if (!store.has(id)) return null;
      const current = store.get(id);
      const next = { ...current, ...clone(patch) };
      store.set(id, next);
      return clone(next);
    }
  };
}

export function createInMemoryRepositories(seed = {}) {
  const profileStore = createStore(seed.profiles, "player_id");
  const sessionStore = createStore(seed.sessions, "session_id");
  const matchStore = createStore(seed.matches, "match_id");
  const rewardClaimStore = createStore(seed.reward_claims, "claim_id");

  return {
    profiles: {
      getProfile(player_id) {
        return profileStore.get(player_id);
      },
      saveProfile(profile) {
        return profileStore.save(profile);
      },
      updateProfile(player_id, patch) {
        return profileStore.update(player_id, patch);
      }
    },
    sessions: {
      getSession(session_id) {
        return sessionStore.get(session_id);
      },
      saveSession(session) {
        return sessionStore.save(session);
      }
    },
    matches: {
      getMatch(match_id) {
        return matchStore.get(match_id);
      },
      saveMatch(match) {
        return matchStore.save(match);
      },
      saveMatchResult(match_id, result) {
        const match = matchStore.get(match_id);
        if (!match) return null;

        const savedResult = clone(result);
        match.result = savedResult;
        matchStore.save(match);
        return clone(savedResult);
      }
    },
    reward_claims: {
      getRewardClaim(claim_id) {
        return rewardClaimStore.get(claim_id);
      },
      saveRewardClaim(claim) {
        return rewardClaimStore.save(claim);
      }
    }
  };
}
