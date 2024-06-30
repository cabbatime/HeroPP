import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Cycles from './pages/Cycles';
import Delivery from './pages/Delivery';
import Roadmap from './pages/Roadmap';
import Changelog from './pages/Changelog';

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-900 min-h-screen flex flex-col bg-gray-800 text-white">
        <header className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center shadow-md">
          <span className="font-bold text-blue-400 text-lg">Your App</span>
          <nav className="space-x-4">
            <Link to="/cycles" className="hover:underline">Cycles</Link>
            <Link to="/delivery" className="hover:underline">Delivery</Link>
            <Link to="/roadmap" className="hover:underline">Roadmap</Link>
            <Link to="/changelog" className="hover:underline">Changelog</Link>
          </nav>
        </header>

        <main className="flex-1 p-6">
          <Routes>
            <Route path="/cycles" element={<Cycles />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/" element={<Cycles />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
