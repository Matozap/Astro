export const environment = {
  production: true,
  // Set via Angular file replacement or update before deploying.
  // This should be the full URL to your Azure Container App, e.g.:
  // https://astro-api.happyocean-xxxxx.eastus.azurecontainerapps.io/graphql
  graphqlUrl: 'https://REPLACE_WITH_CONTAINER_APP_URL/graphql',
  graphqlWsUrl: 'wss://REPLACE_WITH_CONTAINER_APP_URL/graphql',
};
