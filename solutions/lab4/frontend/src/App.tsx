import React from "react";
import { useMsal, MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, protectedResources } from "./authConfig";
import axios from "axios";

const msalInstance = new PublicClientApplication(msalConfig);

function SecureContent() {
  const { instance, accounts } = useMsal();

  const callApi = async () => {
    const response = await instance.acquireTokenSilent({
      account: accounts[0],
      scopes: protectedResources.api.scopes,
    });
    const result = await axios.get(protectedResources.api.endpoint, {
      headers: { Authorization: `Bearer ${response.accessToken}` },
    });
    alert(JSON.stringify(result.data));
  };

  return (
    <>
      <p>Welcome, {accounts[0]?.username}!</p>
      <button onClick={callApi}>Call Secure API</button>
      <button onClick={() => instance.logout()}>Logout</button>
    </>
  );
}

function App() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect({ scopes: protectedResources.api.scopes });
  };

  return (
    <div>
      <h1>Secure React App</h1>
      <AuthenticatedTemplate>
        <SecureContent />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <button onClick={handleLogin}>Login</button>
      </UnauthenticatedTemplate>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  );
}