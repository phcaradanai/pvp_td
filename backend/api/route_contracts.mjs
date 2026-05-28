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
    }
  ]
};
