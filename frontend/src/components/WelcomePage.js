import React from "react";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate("/data-visualization");
  };

  return (
    <div style={{ 
      textAlign: "center", 
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh", 
      padding: "20px",
      fontFamily: "'Arial', sans-serif",
      boxSizing: "border-box"
    }}>
      <h1 style={{
        fontSize: "clamp(56px, 12vw, 92px)", // Responsive font size
        fontWeight: "900",
        background: "linear-gradient(45deg, #00c6ff, #0072ff, #5e3cd1)",
        WebkitBackgroundClip: "text",
        color: "transparent",
        textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
        letterSpacing: "2px",
        textTransform: "uppercase",
        filter: "drop-shadow(3px 3px 2px rgba(0,0,0,0.2))",
        lineHeight: "1.2",
        maxWidth: "100%",
        wordWrap: "break-word"
      }}>
        Welcome Alchemist
      </h1>
      <button 
        onClick={handleProceed} 
        style={{
          padding: "10px 20px",
          fontSize: "clamp(14px, 4vw, 16px)", // Responsive font size
          background: "linear-gradient(to right, #00b4db, #0083b0)",
          color: "white",
          border: "none",
          borderRadius: "25px",
          cursor: "pointer",
          transition: "transform 0.3s ease",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          textTransform: "uppercase",
          fontWeight: "bold",
          maxWidth: "100%",
          width: "auto"
        }}
        onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
        onMouseOut={(e) => e.target.style.transform = "scale(1)"}
      >
        Proceed to DataAlchemy: Data Visualization Tool
      </button>
    </div>
  );
}

export default WelcomePage;