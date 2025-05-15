import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn.jsx";
import Meeting from "./pages/Meeting.jsx";
import Summary from "./pages/Summary.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public sign-in page */}
        <Route path="/" element={<SignIn />} />

        {/* Protected routes */}
        <Route
          path="/meeting"
          element={
            <RequireAuth>
              <Meeting />
            </RequireAuth>
          }
        />
        <Route
          path="/summary"
          element={
            <RequireAuth>
              <Summary />
            </RequireAuth>
          }
        />

        {/* Optional 404 */}
        <Route
          path="*"
          element={
            <div className="p-6 text-center text-red-500">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
