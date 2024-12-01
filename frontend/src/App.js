import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import DataVisualization from "./DataVisualization.js";
import WelcomePage from "./components/WelcomePage.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/data-visualization" element={<DataVisualization />} />
      </Routes>
    </Router>
  );
}

export default App;
