import './PortfolioTable.css';

function PortfolioTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="portfolio-table-container">
        <div className="portfolio-table-empty">
          No portfolio data available
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-table-container">
      <table className="portfolio-table">
        <thead>
          <tr>
            {data[0] &&
              Object.keys(data[0]).map((key) => (
                <th key={key}>
                  {key}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, i) => (
                <td key={i}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PortfolioTable;