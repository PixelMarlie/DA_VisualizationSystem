import React from "react";
import './ChartOption.css'; // Import the CSS file

const ChartOptions = ({ sortColumns, onSortChange }) => {
  return (
    <div className="chart-options">
      <label className="label">Sort columns by lowest numeric row value?</label>
      
      <div className="radio-group">
        <input
          type="radio"
          id="sort-yes"
          name="sortColumns"
          value="yes"
          checked={sortColumns === true}
          onChange={() => onSortChange(true)}
          className="radio-input"
        />
        <label htmlFor="sort-yes" className="radio-label">Yes</label>

        <input
          type="radio"
          id="sort-no"
          name="sortColumns"
          value="no"
          checked={sortColumns === false}
          onChange={() => onSortChange(false)}
          className="radio-input"
        />
        <label htmlFor="sort-no" className="radio-label">No</label>
      </div>
    </div>
  );
};

export default ChartOptions;
