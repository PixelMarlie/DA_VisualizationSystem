import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap import
import React, { useEffect, useState } from 'react';

const CsvUpload = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [message, setMessage] = useState(""); // State to store success/error messages

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

  const handleTableSelect = (tableName) => {
    // Fetch data for the selected table
    axios.get(`http://localhost:8000/api/view_table/${tableName}/`)
      .then(response => {
        setSelectedTable(tableName);
        setTableData(response.data);
      })
      .catch(error => {
        console.error('Error fetching table data:', error);
        setMessage("Error fetching table data.");
      });
  };

  return (
    <div className="csv-upload-section">
    <h2 className="text-center">Upload CSV File</h2>
    <div className="row justify-content-center">
      <div className="col-12 col-md-12">
        <input type="file" className="form-control mb-3" onChange={handleFileChange} />
        <button className="btn btn-primary btn-block" onClick={handleUpload}>Upload CSV</button>
      </div>
    </div>

    {message && <p className="text-center mt-3">{message}</p>}

    <h3 className="text-center mt-5">List of CSV Files Uploaded</h3>
    <ul className="list-group">
      {tables.map((table, index) => (
        <li className="list-group-item list-group-item-action" key={index} onClick={() => handleTableSelect(table)}>
          {table}
        </li>
      ))}
    </ul>

    {selectedTable && tableData && (
      <div className="mt-5">
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
