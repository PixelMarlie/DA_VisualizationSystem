import React from 'react';

const ChartDisplay = ({ chartUrl }) => {
    return (
        <div>
            {chartUrl ? (
                <iframe
                    src={chartUrl}
                    width="100%"
                    height="500px"
                    title="Generated Chart"
                    style={{ border: 'none' }}
                />
            ) : (
                <p>No chart generated yet.</p>
            )}
        </div>
    );
};

export default ChartDisplay;
