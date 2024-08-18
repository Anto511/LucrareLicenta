import React from 'react';
import './ShowResults.css';

const ShowResults = ({ results }) => {
    if (!Array.isArray(results)) {
        return (
            <div className='noresultscase'>
                <div>No results have been found, we are sorry!</div>
            </div>
        );
    }

    const uniqueResults = results.filter((result, index, self) =>
        index === self.findIndex((r) => r.url === result.url)
    );

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>URL</th>
                        <th>Company</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    {uniqueResults.map((item) => (
                        <tr key={item.ID}>
                            <td>{item.ID}</td>
                            <td>{item.title}</td>
                            <td className="url-cell">
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    Click me
                                </a>
                            </td>
                            <td>{item.company}</td>
                            <td>{item.location}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ShowResults;
