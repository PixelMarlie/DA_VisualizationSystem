// frontend/src/App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import CsvUpload from "./components/CsvUpload";
import './styles/styles.css';

function App() {
  return (
    <div className="container-fluid">
      {/* Main Content */}
      <div className="row">
        {/* Left Column - For Data Reporting and Interpretation Cards */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <h3 className="card-header">Data Reporting</h3>
            <div className="card-body">
              {/* Here you can add graph visualization */}
              <div className="graph-container">
                {/* Graph visualization goes here */}
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
          <CsvUpload />
        </div>
      </div>
    </div>
  );
}

export default App;