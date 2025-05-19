import { createContext, useContext, useEffect, useState } from "react";

const CalendarAuthContext = createContext();

export function CalendarAuthProvider({ children }) {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("calendarToken") || null);

  const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
  const API_KEY = "YOUR_GOOGLE_API_KEY";
  const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
  const SCOPES = "https://www.googleapis.com/auth/calendar.events";

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES,
      }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        setIsSignedIn(authInstance.isSignedIn.get());

        authInstance.isSignedIn.listen(setIsSignedIn);

        if (authInstance.isSignedIn.get()) {
          const user = authInstance.currentUser.get();
          const accessToken = user.getAuthResponse().access_token;
          localStorage.setItem("calendarToken", accessToken);
          setToken(accessToken);
        }
      });
    };

    gapi.load("client:auth2", () => {
      setGapiLoaded(true);
      initClient();
    });
  }, []);

  const signIn = () => {
    gapi.auth2.getAuthInstance().signIn().then(user => {
      const accessToken = user.getAuthResponse().access_token;
      localStorage.setItem("calendarToken", accessToken);
      setToken(accessToken);
      setIsSignedIn(true);
    });
  };

  const signOut = () => {
    gapi.auth2.getAuthInstance().signOut().then(() => {
      localStorage.removeItem("calendarToken");
      setToken(null);
      setIsSignedIn(false);
    });
  };

  return (
    <CalendarAuthContext.Provider value={{ token, isSignedIn, gapiLoaded, signIn, signOut }}>
      {children}
    </CalendarAuthContext.Provider>
  );
}

export const useCalendarAuth = () => useContext(CalendarAuthContext);
