import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Meeting from "./pages/Meeting.jsx";
import Summary from "./pages/Summary.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /meeting */}
        <Route path="/" element={<Navigate to="/meeting" replace />} />

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
