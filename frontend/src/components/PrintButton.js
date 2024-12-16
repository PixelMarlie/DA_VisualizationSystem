import axios from "axios";
import React from "react";
import './ui/styles.css';

const PrintButton = ({ chartUrl2, interpretation, setMessage }) => {  // Pass PNG URL (chartUrl2)
  const handlePrint = async () => {
    try {
      setMessage("Saving report as PDF..."); 

      const response = await axios.post(
        "http://localhost:8000/api/generate_pdf/",
        { chartUrl: chartUrl2, interpretation }, // Send PNG URL to backend
        {
          responseType: "blob", // Expect PDF as a blob
        }
      );

      // Create a downloadable PDF link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "DataAlchemy_chart_report.pdf";
      a.click();

      setMessage("Report has been successfully saved as PDF!"); // Notify success

      // Cleanup the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage("Failed to save the report as PDF."); // Notify failure
    }
  };

  return (
    <span style={{ paddingLeft: '10px' }}>
        <button className="btn btn-primary" onClick={handlePrint} disabled={!chartUrl2}>
            Print Report
        </button>
    </span>
  );
};

export default PrintButton;
