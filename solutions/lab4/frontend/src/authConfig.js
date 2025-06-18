export const msalConfig = {
    auth: {
      clientId: "xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // Replace with your client ID
      authority: "https://login.microsoftonline.com/xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // Replace with your tenant ID
      redirectUri: "http://localhost:3000",
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false,
    },
  };
  
  export const protectedResources = {
    api: {
      endpoint: "http://localhost:5000/api/secure",
      scopes: ["api://xxx-xxxxxxx/access_as_user"], // Replace with your API scope
    },
  };