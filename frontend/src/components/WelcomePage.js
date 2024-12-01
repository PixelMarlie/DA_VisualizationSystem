import React from "react";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate("/data-visualization");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <h1>Welcome Alchemist!</h1>
      <p>Click below to proceed generating data visualization charts.</p>
      <button 
        onClick={handleProceed} 
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Proceed to DataAlchemy: Data Visualization Tool
      </button>
    </div>
  );
}

export default WelcomePage;
