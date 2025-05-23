import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Meeting from "./pages/Meeting.jsx";
import Summary from "./pages/Summary.jsx";

function App() {
  //Render JSX
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/meeting" element={<Meeting />} />
        <Route path="/summary" element={<Summary />} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
