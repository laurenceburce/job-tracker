import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Tracker from "./pages/Tracker";
import Matcher from "./pages/Matcher";
import CoverLetter from "./pages/CoverLetter";

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
        <Link className="navbar-brand" to="/">JobApp AI</Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/">Tracker</Link>
          <Link className="nav-link" to="/matcher">Resume Matcher</Link>
          <Link className="nav-link" to="/cover-letter">Cover Letter</Link>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Tracker />} />
          <Route path="/matcher" element={<Matcher />} />
          <Route path="/cover-letter" element={<CoverLetter />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
