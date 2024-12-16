import React from "react";
import { useNavigate } from "react-router-dom";
import BG from "./BG.png";
import BG_Card from "./BG_Card.jpg";
import BG_Mobile from "./BG_Mobile.png";
import { Card } from "./ui/Card.tsx";

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
      minHeight: "100vh",
      height: "100%",
      padding: "20px",
      fontFamily: "'Arial', sans-serif",
      boxSizing: "border-box",
      overflowX: "hidden",
      overflowY: "auto",
    }}
    className="responsive-background"
    >
    <style>
    {`
      .responsive-background {
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
      }

      @media (min-width: 768px) {
        .responsive-background {
          background-image: url(${BG}); /* Desktop background */
        }
      }

      @media (max-width: 767px) {
        .responsive-background {
          background-image: url(${BG_Mobile}); /* Mobile background */
        }
      }
    `}
    </style>
      <Card 
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(70px, 20vw, 60px)",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
          textAlign: "center",
          width: "clamp(380px, 110vw, 700px)",
          maxWidth: "100%",
          margin: "auto",
          gap: "30px",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `url(${BG_Card})`, // Use backgroundImage with template literal
          backgroundSize: "cover", // Ensure the image covers the entire container
          backgroundRepeat: "no-repeat", // Prevent tiling
          backgroundPosition: "center", // Center the image
          border: "2px solid transparent", // Prepare for glow border
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 0 40px rgba(0, 123, 255, 0.6), 0 0 80px rgba(0, 123, 255, 0.4)";
          e.currentTarget.style.border = "2px solid rgba(0, 123, 255, 0.5)";
          e.currentTarget.style.transform = "scale(1.6)"; // Slightly increased scale
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
          e.currentTarget.style.border = "2px solid transparent";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <h1 style={{
          fontSize: "clamp(22px, 8vw, 68px)",
          fontWeight: "800",
          background: "linear-gradient(45deg, #00c6ff, #0072ff, #5e3cd1)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          letterSpacing: "clamp(1px, 2vw, 2px)",
          textTransform: "uppercase",
          filter: "drop-shadow(3px 3px 2px rgba(0,0,0,0.2))",
          lineHeight: "1.2",
          width: "100%", // Ensure full width
          wordWrap: "break-word", // Allow word wrapping
          whiteSpace: "normal",
          textAlign: "center",
          padding: "0 10px",
          overflowWrap: "break-word", // Ensure long words break
          hyphens: "auto" // Allow hyphenation if needed
        }}>
          Welcome!
        </h1>
        <button 
          onClick={handleProceed} 
          style={{
            padding: "clamp(8px, 3vw, 10px) clamp(16px, 5vw, 20px)",
            fontSize: "clamp(12px, 3vw, 16px)",
            background: "linear-gradient(to right, #00b4db, #0083b0)",
            color: "white",
            border: "none",
            borderRadius: "25px",
            cursor: "pointer",
            transition: "transform 0.3s ease",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            fontWeight: "bold",
            width: "auto",
            maxWidth: "100%",
            wordBreak: "break-word", // Ensure long words break
            overflowWrap: "break-word", // Alternative word breaking
            hyphens: "auto" // Allow hyphenation
          }}
          onMouseOver={(e) => e.target.style.transform = "scale(1.15)"}
          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          DataAlchemy: Data Visualization Tool
        </button>
      </Card>
    </div>
  );
}

export default WelcomePage;