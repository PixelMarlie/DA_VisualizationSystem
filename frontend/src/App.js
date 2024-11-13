// frontend/src/App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from "react";
import CsvUpload from "./components/CsvUpload";
import LOGO from './styles/images/LOGO.png';
import './styles/styles.css';

function App() {
  const [chartUrl, setChartUrl] = useState(''); // Define chartUrl state

  return (
    <div className="container-fluid">
      {/* Main Content */}
      <div className="row">
        {/* Left Column - For Data Reporting and Interpretation Cards */}
        <div className="col-lg-8">
          
        <div className="card mb-4">
          <h3 className="card-header2">
            DataAlchemy: Data Visualization Tool
            <img src= {LOGO} alt="LOGO.png" />
            </h3>
        </div>

          <div className="card mb-4">
            <h3 className="card-header">Data Reporting</h3>
            <div className="card-body">
              {/* graph visualization */}
              <div className="graph-container">
              {chartUrl && (
                  <img src={chartUrl} alt="Generated Chart" className="img-fluid" />
                )}
              </div>
            </div>
          </div>

          {/* Interpretation Card */}
          <div className="card mb-4">
            <h3 className="card-header">Interpretation</h3>
            <div className="card-body">
              {/* Interpretation details */}
              <p>Interpretation of the data will go here.</p>
            </div>
          </div>
        </div>

        {/* Right Column - For CSV File Upload and List of Tables */}
        <div className="col-lg-4">
          <CsvUpload setChartUrl={setChartUrl} /> {/* Pass setChartUrl */}
        </div>
      </div>
    </div>
  );
}

export default App;
