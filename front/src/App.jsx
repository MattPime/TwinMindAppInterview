import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Meeting from "./pages/Meeting.jsx";
import Summary from "./pages/Summary.jsx";
import MeetingDetails from "./pages/MeetingDetails.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/meeting" element={<Meeting />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/meeting/:id" element={<RequireAuth> <MeetingDetails /> </RequireAuth>} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
