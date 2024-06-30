import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from 'react-router-dom';
import { useClickAway } from 'react-use';
import Cycles from './Cycles';
import Delivery from './Delivery';
import Roadmap from './Roadmap';
import Changelog from './Changelog';

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
          <Switch>
            <Route path="/cycles" component={Cycles} />
            <Route path="/delivery" component={Delivery} />
            <Route path="/roadmap" component={Roadmap} />
            <Route path="/changelog" component={Changelog} />
            <Route path="/" exact component={Cycles} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
