// frontend/src/App.js
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from "react";
import ChartDisplay from './components/ChartDisplay.js';
import LOGO from './styles/images/LOGO.png';
import PLM from './styles/images/PLM.png';
import './styles/styles.css';

function App() {
  //CSV File and Table Handling states
  const [csvFile, setCsvFile] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);

  const [message, setMessage] = useState(""); // State to store success/error messages
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [xData, setXData] = useState([]); // Store x-axis data for the chart
  const [yData, setYData] = useState([]); // Store y-axis data for the chart
  const [chartType, setChartType] = useState('');
  const [chartUrl, setChartUrl] = useState('');
  const [chartUrl2, setChartUrl2] = useState('');

  // states for interpretation
  const [interpretation, setInterpretation] = useState('');
  const [showEmailCard, setShowEmailCard] = useState(false);
  const [email, setEmail] = useState('');
  const [isChartGenerated, setIsChartGenerated] = useState(false);

  // Data Cleaning Outlier Cleaning Selection
  const [outlierAction, setOutlierAction] = useState('cap'); // Default to 'cap'

  //area chart
  const [additionalYAxes, setAdditionalYAxes] = useState([]); // Store selected additional Y-axes
  const [numAdditionalYAxes, setNumAdditionalYAxes] = useState(0); // Number of additional Y-axes

// Candlestick chart state
  const [openColumn, setOpenColumn] = useState(""); 
  const [closeColumn, setCloseColumn] = useState(""); 
  const [highColumn, setHighColumn] = useState(""); 
  const [lowColumn, setLowColumn] = useState(""); 

  useEffect(() => {
    // Fetch the list of uploaded tables from the backend
    axios.get('http://localhost:8000/api/list_tables/')
      .then(response => {
        setTables(response.data.tables);
      })
      .catch(error => {
        console.error('Error fetching tables:', error);
      });
  }, []);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('csv_file', csvFile);

    // Show a loading message or clear previous messages
    setMessage("Uploading...");

    axios.post('http://localhost:8000/api/upload/', formData)
      .then(response => {
        console.log('CSV uploaded successfully');
        setMessage("CSV cleaned and uploaded successfully!");
        // Refetch tables after successful upload
        axios.get('http://localhost:8000/api/list_tables/')
          .then(response => {
            setTables(response.data.tables);
          });
      })
      .catch(error => {
        console.error('Error uploading CSV:', error);
        setMessage("Error uploading CSV. Please try again.");
      });
  };

//Select Table to Fetch AND Selcect X and Y Axis from Fetched Table's Columns
  const handleTableSelect = (tableName) => {
    axios.get(`http://localhost:8000/api/view_table/${tableName}/`)
      .then(response => {
        setSelectedTable(tableName);
        setTableData(response.data);
      })
      .catch(error => {
        console.error('Error fetching table data:', error);
        setMessage("Error fetching table data.");
      });
  
    axios.get(`http://localhost:8000/api/fetch_columns/${tableName}/`)
      .then(response => {
        console.log('Columns fetched:', response.data.columns); // debug
        setColumns(response.data.columns);
        setXAxis('');
        setYAxis('');
      })
      .catch(error => {
        console.error('Error fetching columns:', error);
        setMessage("Error fetching columns.");
      });
  };
  
  
//(Chart Generation)
const handleGenerateChart = () => {
  const yAxes = [yAxis, ...additionalYAxes];
  axios.post('http://localhost:8000/api/generate_chart/', {
    table_name: selectedTable,
    x_axis: xAxis,
    y_axes: yAxes,
    chart_type: chartType,
    open_column: openColumn,
    close_column: closeColumn,
    high_column: highColumn,
    low_column: lowColumn,
  }).then(response => {
    console.log('Chart URL:', response.data.chart_url); // Log the URL to verify
    setChartUrl(`http://localhost:8000${response.data.chart_url}`);
    setChartUrl2(`http://localhost:8000${response.data.chart_url2}`); // Store chartUrl2
    setIsChartGenerated(true);
    setMessage("Chart generated successfully!");
    //after chart generated, a button will appear that allows them to print the generated chart (pdf)

    // Fetch data for selected x and y columns to pass into the charting library if needed
    axios.post('http://localhost:8000/api/fetch_axis_data/', {
      table_name: selectedTable,
      x_axis: xAxis,
      y_axis: yAxis,
    }).then(response => {
      setXData(response.data.x_data);
      setYData(response.data.y_data);
    }).catch(error => {
      console.error('Error fetching axis data:', error);
    });

  }).catch(error => {
    console.error('Error generating chart:', error);
    setMessage("Error generating chart. Please try again.");
  });
};

//Additional Y-Axis Handling
const handleNumAdditionalYAxesChange = (e) => {
  const count = parseInt(e.target.value);
  setNumAdditionalYAxes(count);
  setAdditionalYAxes(Array(count).fill('')); // Initialize with empty values
};

const handleAdditionalYAxisChange = (index, value) => {
  const updatedYAxes = [...additionalYAxes];
  updatedYAxes[index] = value;
  setAdditionalYAxes(updatedYAxes);
};

//View Chart Handling
const handlePrintChart = () => {
  const printWindow = window.open(chartUrl, '_blank');
  if (printWindow) {
    printWindow.focus();
    printWindow.print(); // Trigger print dialog
  } else {
    alert('Unable to open chart for printing.');
  }
};

//Interpretation Handling
const handleSaveInterpretation = () => {
  if (!interpretation) {
    setMessage("Please provide an interpretation before saving.");
    return;
  }
  setShowEmailCard(true);
  setMessage("Interpretation saved. Enter your email to send remarks.");
};

//Send Interpretation and Chart via Email Handling
const handleSendEmail = () => {
  if (!email) {
    setMessage("Please provide a valid email address.");
    return;
  }

  axios.post('http://localhost:8000/api/send_email/', {
    email: email,
    interpretation: interpretation,
    chart_url2: chartUrl2 // Send chartUrl2 as well
  },)
  .then(response => {
    setMessage("Email sent successfully!");
    setShowEmailCard(false);
    setInterpretation('');
    setEmail('');
  })
  .catch(error => {
    console.error('Error sending email:', error);
    setMessage("Failed to send email. Please try again.");
  });
};

  return (
    <div className="container-fluid">
      {/* Main Content */}
      <div className="row">
        {/* Left Column - For Data Reporting and Interpretation Cards */}
        <div className="col-lg-8">
          
        <div className="card mb-4">
          <h3 className="card-header2">
            <img src= {PLM} alt="PLM.png" />
            DataAlchemy: Data Visualization Tool
            <img src= {LOGO} alt="LOGO.png" />
            </h3>
        </div>

          <div className="card mb-4">
            <h3 className="card-header">Data Visualization</h3>
            <div className="card-body">
              {/* graph visualization */}
              <div className="graph-container">
                {/* Use the ChartDisplay component */}
                <ChartDisplay chartUrl={chartUrl} />
                {chartUrl && (
                <button className="btn btn-primary btn-block" onClick={handlePrintChart}>View Chart Full Screen</button>
               )}
              </div>
            </div>
          </div>

          {/* Interpretation Card */}
          <div className="card mb-4">
            <h3 className="card-header">Interpretation</h3>
            <div className="card-body">
              {isChartGenerated && (
                <div className="card-body">
                  <textarea
                  className="form-control mb-3"
                  rows="4"
                  placeholder="Write your interpretation here..."
                  value={interpretation}
                  onChange={(e) => setInterpretation(e.target.value)}
                />
                  <button className="btn btn-success" onClick={handleSaveInterpretation}>
                    Save Interpretation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email Interpratation card */}
            {showEmailCard && (
              <div className="card mb-4">
                <h3 className="card-header">Email Interpretation</h3>
                <div className="card-body">
                  <input
                    type="email"
                    className="form-control mb-3"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleSendEmail}>
                    Send Email
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Right Column - For CSV File Upload and List of Tables */}

        <div className="col-lg-4">
          {/* Upload CSV Section */}
          <h2 className="text-center">Upload CSV File</h2>
            <input type="file" className="form-control mb-3" onChange={handleFileChange} />

            <button className="btn btn-primary btn-block" onClick={handleUpload}>Upload CSV</button>

          {message && <p className="text-center mt-3">{message}</p>}

          <h3 className="text-center mt-5">List of CSV Files Uploaded</h3>
          {/* List of CSV Files */}
          <ul className="list-group">
            {tables.map((table, index) => (
              <li className="list-group-item list-group-item-action" key={index} onClick={() => handleTableSelect(table)}>
                {table}
              </li>
            ))}
          </ul>

        {/* Generate Data Report Section */}
        <h3 className="text-center mt-5">Generate Data Visualization</h3>
          <label>Select CSV Table</label>
          <select className="form-control mb-3" onChange={(e) => handleTableSelect(e.target.value)} value={selectedTable || ''}>
            <option value="">--Select a Table--</option>
            {tables.map(table => <option key={table} value={table}>{table}</option>)}
          </select>

          {columns.length > 0 && (
            <>

              <label>Chart Type</label>
              <select className="form-control mb-3" onChange={(e) => setChartType(e.target.value)} value={chartType}>
                <option value="">--Select Chart Type--</option>
                <option value="bar">Bar Chart</option>
                <option value="box">Box Chart</option>
                <option value="candle">Candlestick Chart</option>
                <option value="heat">Heatmap</option>
                <option value="s_area">Area Chart (Single)</option>
                <option value="m_area">Area Chart (Stacked)</option>
                {/*<option value="line">Line Chart</option>*/}
                {/*<option value="scatter">Scatter Plot</option>*/}
                {/*<option value="histogram">Histogram</option>*/}
              </select>

              <label>X-Axis</label>
              <select className="form-control mb-3" onChange={(e) => setXAxis(e.target.value)} value={xAxis}>
                <option value="">--Select X-Axis--</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>

              {chartType != "candle" && (
                <div>
                  <label>Y-Axis</label>
                  <select className="form-control mb-3" onChange={(e) => setYAxis(e.target.value)} value={yAxis}>
                    <option value="">--Select Y-Axis--</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              )}

              {chartType === "m_area" && (
                <div>
                  <label>Number of Additional Y-Axis:</label>
                  <select className="form-control mb-3" value={numAdditionalYAxes} onChange={handleNumAdditionalYAxesChange}>
                    <option value="0">--Select Number--</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                  
                  {[...Array(numAdditionalYAxes)].map((_, idx) => (
                    <div key={idx}>
                      <label>Additional Y-Axis {idx + 1}:</label>
                      <select
                        className="form-control mb-3"
                        value={additionalYAxes[idx]}
                        onChange={(e) => handleAdditionalYAxisChange(idx, e.target.value)}
                      >
                        <option value="">Select Column</option>
                        {columns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {chartType === "candle" && (
                <div>
                  <div>
                    <label>Open:</label>
                    <select
                      className="form-control mb-3"
                      value={openColumn}
                      onChange={(e) => setOpenColumn(e.target.value)}
                    >
                      <option value="">Select Column</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Close:</label>
                    <select
                      className="form-control mb-3"
                      value={closeColumn}
                      onChange={(e) => setCloseColumn(e.target.value)}
                    >
                      <option value="">Select Column</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>High:</label>
                    <select
                      className="form-control mb-3"
                      value={highColumn}
                      onChange={(e) => setHighColumn(e.target.value)}
                    >
                      <option value="">Select Column</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Low:</label>
                    <select
                      className="form-control mb-3"
                      value={lowColumn}
                      onChange={(e) => setLowColumn(e.target.value)}
                    >
                      <option value="">Select Column</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}


              <button className="btn btn-success btn-block" onClick={handleGenerateChart}>Generate Chart</button>
            </>
          )}

          {message && <p>{message}</p>}

            {selectedTable && tableData && (
        <div className="mt-5">
          {/* Show Table Selected */}
          <h4>Data from CSV: {selectedTable}</h4>
          <table className="table table-bordered table-responsive">
            <thead>
              <tr>
                {tableData.columns.map((col, index) => (
                  <th key={index}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default App;
