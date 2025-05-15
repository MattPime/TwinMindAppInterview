import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Meeting from "./pages/Meeting.jsx";
import Summary from "./pages/Summary.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Redirect root to /Login */}
        <Route path="/" element={<Navigate to="/Login" replace />} />

        {/* Meeting page */}
        <Route path="/meeting" element={<Meeting />} />

        {/* Summary page */}
        <Route path="/summary" element={<Summary />} />

        {/* Optional 404 fallback */}
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
