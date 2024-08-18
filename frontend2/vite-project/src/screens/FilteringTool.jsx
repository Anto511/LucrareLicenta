import React, { useState, useEffect, useRef } from 'react';
import './FilterningTool.css';
import { useUser } from './UserContext';
import ShowResults from './ShowResults';

const FilteringTool = () => {
    const { user } = useUser();
    const [filters, setFilters] = useState({ countries: [] });
    const [selectedFilters, setSelectedFilters] = useState({ keywords: '', location: '', country: '' });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);
    const dropAreaRef = useRef(null);

    useEffect(() => {
        fetch('http://localhost:3000/filters')
            .then(response => response.json())
            .then(data => setFilters(data))
            .catch(error => console.error('Error fetching filters:', error));
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSelectedFilters({
            ...selectedFilters,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropAreaRef.current.classList.add('dragging');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropAreaRef.current.classList.remove('dragging');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropAreaRef.current.classList.remove('dragging');
        const files = e.dataTransfer.files;
        if (files.length) {
            setFile(files[0]);
        }
    };

    const uploadPDF = async () => {
        if (!user || !user.email) {
            alert('You need to be logged in to upload your CV.');
            return;
        }

        if (!file) {
            alert('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_email', user.email);
        formData.append('wants_to_be_in_db', user.wants_to_be_in_db);

        try {
            const response = await fetch('http://localhost:3000/upload-pdf', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error processing PDF:', errorData);
                alert(`Error processing PDF:\n${errorData.error}`);
            } else {
                const successData = await response.json();
                return true;
            }
        } catch (error) {
            console.error('Error sending request:', error);
            alert(`${error.message}\nPlease try again.`);
        }
        return false;
    };

    const deletePDF = async () => {
        if (file && user && user.email) {
            try {
                const response = await fetch('http://localhost:3000/delete-pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_email: user.email })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error deleting PDF:', errorData);
                }
            } catch (error) {
                console.error('Error sending delete request:', error);
            }
        }
    };

    const saveFilters = async () => {
        if (!selectedFilters.keywords) {
            alert('Please enter keywords.');
            return;
        }

        if (!selectedFilters.country) {
            alert('Please select a country.');
            return;
        }

        try {
            const filtersResponse = await fetch('http://localhost:3000/process-filters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ selectedFilters, user_email: user.email, wants_to_be_in_db: user.wants_to_be_in_db }),
            });

            if (!filtersResponse.ok) {
                const errorData = await filtersResponse.json();
                console.log('Error Data:', errorData);

                const errors = new Set();

                if (errorData.script_outputs) {
                    errorData.script_outputs.forEach(output => {
                        if (output.stdout) {
                            output.stdout.split('.').forEach(sentence => errors.add(sentence.trim()));
                        }
                    });
                }

                const errorMessages = Array.from(errors).filter(sentence => sentence).join('.\n');
                console.log('Error Messages:', errorMessages);

                const mainErrorMessage = errorData.message ? errorData.message : 'An error occurred';
                throw new Error(`${mainErrorMessage}. ${errorMessages}`);
            }

            const resultData = await filtersResponse.json();
            setResults(resultData.data);
        } catch (error) {
            console.error('Error sending filters:', error);
            alert(`${error.message}\nPlease try again.`);
        }
    };

    const handleButtonClick = async () => {
        setUploading(true);
        const pdfUploaded = await uploadPDF();
        if (pdfUploaded) {
            await saveFilters();
        }
        setUploading(false);
    };

    useEffect(() => {
        if (!user) {
            setResults(null);
            setFile(null);
            setSelectedFilters({ keywords: '', location: '', country: '' });
            deletePDF();
        }
    }, [user]);

    return (
        <div>
            <div className="upload-card text-center p-4 mb-5" id='cardbox'>
                <div
                    className="upload-area mb-4"
                    id="uploadpdf"
                    ref={dropAreaRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="form-control-file"
                        id="fileUpload"
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="fileUpload" className="upload-label">
                        {file ? file.name : 'Drag & Drop file here or Click to choose file'}
                    </label>
                </div>
                <div>
                    <div id="filteringTool">
                        <div className="filter-section">
                            <div className="firstrow">
                                <label>
                                    Keywords:
                                    <input
                                        type="text"
                                        name="keywords"
                                        value={selectedFilters.keywords}
                                        onChange={handleFilterChange}
                                        placeholder="Enter keywords"
                                    />
                                </label>
                            </div>
                            <div className="secondrow">
                                <label>
                                    Location:
                                    <input
                                        type="text"
                                        name="location"
                                        value={selectedFilters.location}
                                        onChange={handleFilterChange}
                                        placeholder="Enter location"
                                    />
                                </label>
                            </div>
                            <label>
                                Country:
                                <select name="country" value={selectedFilters.country} onChange={handleFilterChange}>
                                    <option value="">Select a country</option>
                                    {filters.countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
                <button
                    className="btn btn-upload btn-lg"
                    onClick={handleButtonClick}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Upload PDF'}
                </button>
                {uploading && (
                    <div className="progress mt-3">
                        <div className="progress-bar progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            style={{ width: '100%' }}>
                        </div>
                    </div>
                )}
            </div>
            <div>
                <div >
                    {results && user && <ShowResults results={results} />} { }
                </div>
            </div>
        </div>
    );
};

export default FilteringTool;
