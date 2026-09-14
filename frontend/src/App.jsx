import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Board from './pages/Board';
import CandidateView from './pages/CandidateView';
import InterviewerView from './pages/InterviewerView';
import AdminView from './pages/AdminView';
import TvView from './pages/TvView';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/board" element={<Board />} />
            <Route path="/tv" element={<TvView />} />
            <Route path="/candidate" element={<CandidateView />} />
            <Route path="/interviewer" element={<InterviewerView />} />
            <Route path="/admin" element={<AdminView />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
