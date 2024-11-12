import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap import
import React, { useEffect, useState } from 'react';

const CsvUpload = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [message, setMessage] = useState(""); // State to store success/error messages
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('');
  const [chartUrl, setChartUrl] = useState('');

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
        setMessage("CSV uploaded successfuully!");
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
  
  
//Non-Functional
  const handleGenerateChart = () => {
    axios.post('http://localhost:8000/api/generate_chart/', {
      table_name: selectedTable,
      x_axis: xAxis,
      y_axis: yAxis,
      chart_type: chartType
    }).then(response => {
      setChartUrl(response.data.chart_url); // Update to display the generated chart
      setMessage("Chart generated successfully!");
    }).catch(error => {
      console.error('Error generating chart:', error);
      setMessage("Error generating chart. Please try again.");
    });
  };

  return (
    
    <div className="csv-upload-section">
      {/* Upload CSV Section */}
    <h2 className="text-center">Upload CSV File</h2>
    <div className="row justify-content-center">
      <div className="col-12 col-md-12">
        <input type="file" className="form-control mb-3" onChange={handleFileChange} />
        <button className="btn btn-primary btn-block" onClick={handleUpload}>Upload CSV</button>
      </div>
    </div>


      {/* Generate Data Report Section */}
      <h3 className="text-center mt-5">Generate Data Report</h3>
      <div className="mt-3">
        <label>Select CSV Table</label>
        <select className="form-control mb-3" onChange={(e) => handleTableSelect(e.target.value)} value={selectedTable || ''}>
          <option value="">Select a Table</option>
          {tables.map(table => <option key={table} value={table}>{table}</option>)}
        </select>

        {columns.length > 0 && (
          <>
            <label>X-Axis</label>
            <select className="form-control mb-3" onChange={(e) => setXAxis(e.target.value)} value={xAxis}>
              <option value="">Select X-Axis</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>

            <label>Y-Axis</label>
            <select className="form-control mb-3" onChange={(e) => setYAxis(e.target.value)} value={yAxis}>
              <option value="">Select Y-Axis</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>

            <label>Chart Type</label>
            <select className="form-control mb-3" onChange={(e) => setChartType(e.target.value)} value={chartType}>
              <option value="">Select Chart Type</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="line">Line Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="row">Row Chart</option>
            </select>

            <button className="btn btn-success btn-block" onClick={handleGenerateChart}>Generate Chart</button>
          </>
        )}
            {chartUrl && (
                <div className="text-center mt-4">
                  <h4>Generated Chart</h4>
                  <img src={chartUrl} alt="Generated Chart" className="img-fluid" />
                </div>
              )}
            </div>

    {selectedTable && tableData && (
      <div className="mt-5">
        {/* Show Table Selected */}
        <h4>Data from Table: {selectedTable}</h4>
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
  );
};

export default CsvUpload;
