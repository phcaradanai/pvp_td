export const routeMetadata = {
  routes: [
    {
      method: "GET",
      path: "/health",
      handler: "handleHealthCheck"
    },
    {
      method: "POST",
      path: "/match-results/validate",
      handler: "handleValidateMatchResult"
    },
    {
      method: "POST",
      path: "/reward-claims/preview",
      handler: "handleRewardClaimPreview"
    },
    {
      method: "POST",
      path: "/protected/match-results/validate",
      handler: "handleProtectedValidateMatchResult"
    },
    {
      method: "POST",
      path: "/protected/reward-claims/preview",
      handler: "handleProtectedRewardClaimPreview"
    },
    {
      method: "POST",
      path: "/protected/match-results/validate-and-persist",
      handler: "handleProtectedValidateAndPersistMatchResult"
    },
    {
      method: "POST",
      path: "/protected/reward-claims/preview-and-persist",
      handler: "handleProtectedRewardClaimPreviewAndPersist"
    },
    {
      method: "POST",
      path: "/idempotent/protected/match-results/validate-and-persist",
      handler: "handleIdempotentProtectedValidateAndPersistMatchResult"
    },
    {
      method: "POST",
      path: "/idempotent/protected/reward-claims/preview-and-persist",
      handler: "handleIdempotentProtectedRewardClaimPreviewAndPersist"
    },
    {
      method: "POST",
      path: "/store/protected/match-results/validate",
      handler: "handleStoreProtectedValidateMatchResult"
    },
    {
      method: "POST",
      path: "/store/protected/reward-claims/preview",
      handler: "handleStoreProtectedRewardClaimPreview"
    },
    {
      method: "POST",
      path: "/store/protected/match-results/validate-and-persist",
      handler: "handleStoreProtectedValidateAndPersistMatchResult"
    },
    {
      method: "POST",
      path: "/store/protected/reward-claims/preview-and-persist",
      handler: "handleStoreProtectedRewardClaimPreviewAndPersist"
    },
    {
      method: "POST",
      path: "/store/idempotent/protected/match-results/validate-and-persist",
      handler: "handleStoreIdempotentProtectedValidateAndPersistMatchResult"
    },
    {
      method: "POST",
      path: "/store/idempotent/protected/reward-claims/preview-and-persist",
      handler: "handleStoreIdempotentProtectedRewardClaimPreviewAndPersist"
    },
    {
      method: "POST",
      path: "/store-match/protected/match-results/validate",
      handler: "handleStoreMatchProtectedValidateMatchResult"
    },
    {
      method: "POST",
      path: "/store-match/protected/reward-claims/preview",
      handler: "handleStoreMatchProtectedRewardClaimPreview"
    },
    {
      method: "POST",
      path: "/store-match/protected/match-results/validate-and-persist",
      handler: "handleStoreMatchProtectedValidateAndPersistMatchResult"
    },
    {
      method: "POST",
      path: "/store-match/protected/reward-claims/preview-and-persist",
      handler: "handleStoreMatchProtectedRewardClaimPreviewAndPersist"
    },
    {
      method: "POST",
      path: "/store-match/idempotent/protected/match-results/validate-and-persist",
      handler: "handleStoreMatchIdempotentProtectedValidateAndPersistMatchResult"
    },
    {
      method: "POST",
      path: "/store-match/idempotent/protected/reward-claims/preview-and-persist",
      handler: "handleStoreMatchIdempotentProtectedRewardClaimPreviewAndPersist"
    }
  ]
};
