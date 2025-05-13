import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Meeting from "./pages/Meeting";
import Summary from "./pages/Summary";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/meeting" element={<Meeting />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
