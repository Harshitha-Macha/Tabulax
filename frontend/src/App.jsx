import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import HomePage from './homepage.jsx';

const steps = [
  'Learn Transformation',
  'Apply Transformation',
  'Connect to MySQL',
  'Connect to MongoDB',
];

export default function App({ onLogout }) {
  const [step, setStep] = useState(0);

  // Step 1
  const [sourceFile, setSourceFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const [sourceColumns, setSourceColumns] = useState([]);
  const [targetColumns, setTargetColumns] = useState([]);
  const [selectedSourceCol, setSelectedSourceCol] = useState('');
  const [selectedTargetCol, setSelectedTargetCol] = useState('');
  const [preview, setPreview] = useState(null);
  const [transformationType, setTransformationType] = useState(null);
  const [isPreviewApproved, setIsPreviewApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Step 2
  const [applyFile, setApplyFile] = useState(null);
  const [applyCol, setApplyCol] = useState('');
  const [applyColumns, setApplyColumns] = useState([]);
  const [applyPreview, setApplyPreview] = useState(null);

  // Step 3 state
  const [mysqlPassword, setMysqlPassword] = useState('');
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [tablePreview, setTablePreview] = useState(null);  // For initial table preview
  const [dbPreview, setDbPreview] = useState(null);  // For transformed table preview
  const [dbDownloadUrl, setDbDownloadUrl] = useState('');
  const [dbError, setDbError] = useState('');

  // Step 4: MongoDB
  const [mongoDatabases, setMongoDatabases] = useState([]);
  const [selectedMongoDb, setSelectedMongoDb] = useState('');
  const [mongoCollections, setMongoCollections] = useState([]);
  const [selectedMongoCollection, setSelectedMongoCollection] = useState('');
  const [selectedMongoColumn, setSelectedMongoColumn] = useState('');
  const [mongoPreview, setMongoPreview] = useState(null);
  const [mongoTransformedPreview, setMongoTransformedPreview] = useState(null);
  const [mongoError, setMongoError] = useState('');
  const [mongoSuccess, setMongoSuccess] = useState('');

  // Reset MySQL step state on entering step 3
  useEffect(() => {
    if (step === 2) {
      setMysqlPassword('');
      setDatabases([]);
      setSelectedDatabase('');
      setTables([]);
      setSelectedTable('');
      setColumns([]);
      setSelectedColumn('');
      setTablePreview(null);
      setDbPreview(null);
      setDbDownloadUrl('');
      setDbError('');
    }
    if (step === 3) {
      setMongoDatabases([]);
      setSelectedMongoDb('');
      setMongoCollections([]);
      setSelectedMongoCollection('');
      setMongoPreview(null);
      setMongoTransformedPreview(null);
      setMongoError('');
      setMongoSuccess('');
      setSelectedMongoColumn('');
    }
  }, [step]);

  // Fetch databases
  const handleMysqlPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setDbError('');
    setDatabases([]);
    setSelectedDatabase('');
    setTables([]);
    setSelectedTable('');
    setColumns([]);
    setSelectedColumn('');
    try {
      const res = await axios.post('http://localhost:5000/api/mysql/databases', { password: mysqlPassword });
      setDatabases(res.data.databases);
    } catch (err) {
      setDbError(err.response?.data?.error || 'Error connecting to MySQL');
    }
    setIsLoading(false);
  };

  // Fetch tables for selected database
  const handleDatabaseSelect = async (db) => {
    setSelectedDatabase(db);
    setTables([]);
    setSelectedTable('');
    setColumns([]);
    setSelectedColumn('');
    setTablePreview(null);
    setDbPreview(null);
    setIsLoading(true);
    setDbError('');
    try {
      const res = await axios.post('http://localhost:5000/api/mysql/tables', { password: mysqlPassword, database: db });
      setTables(res.data.tables);
    } catch (err) {
      setDbError(err.response?.data?.error || 'Error fetching tables');
    }
    setIsLoading(false);
  };

  // Fetch columns for selected table
  const handleTableSelect = async (tbl) => {
    setSelectedTable(tbl);
    setColumns([]);
    setSelectedColumn('');
    setTablePreview(null);
    setDbPreview(null);
    setIsLoading(true);
    setDbError('');
    try {
      const res = await axios.post('http://localhost:5000/api/mysql/columns', { password: mysqlPassword, database: selectedDatabase, table: tbl });
      setColumns(res.data.columns);
    } catch (err) {
      setDbError(err.response?.data?.error || 'Error fetching columns');
    }
    setIsLoading(false);
  };

  // Fetch table preview after selecting a column
  const handleColumnSelect = async (col) => {
    setSelectedColumn(col);
    setTablePreview(null);
    setDbPreview(null);
    setIsLoading(true);
    setDbError('');
    try {
      const res = await axios.post('http://localhost:5000/api/mysql/preview_table', {
        password: mysqlPassword,
        database: selectedDatabase,
        table: selectedTable,
      });
      setTablePreview(res.data);
    } catch (err) {
      setDbError(err.response?.data?.error || 'Error fetching table preview');
    }
    setIsLoading(false);
  };

  // Apply transformation to DB table
  const handleDbApply = async () => {
    if (!preview) {
      setDbError('No transformation available. Please complete Step 1 first.');
      return;
    }
    setIsLoading(true);
    setDbError('');
    setDbPreview(null);
    setDbDownloadUrl('');
    try {
      const response = await axios.post('http://localhost:5000/api/mysql/apply_transformation_and_store', {
        password: mysqlPassword,
        database: selectedDatabase,
        table: selectedTable,
        column: selectedColumn,
        transformation_type: transformationType,
        function_code: preview?.type === 'llm' ? preview.description : '',
        func_name: preview?.type === 'numeric' ? preview.func_name : '',
        params: preview?.type === 'numeric' ? preview.params : [],
      }, {
        responseType: 'blob',
      });

      // Check if the response is JSON or CSV
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        // Parse JSON and set as dbPreview
        const text = await response.data.text();
        const json = JSON.parse(text);
        setDbPreview(json);
      } else {
        // Parse CSV as before
        const text = await response.data.text();
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1, 6).map(row => {
          const cols = row.split(',').map(c => c.trim());
          return headers.reduce((obj, header, idx) => {
            obj[header] = cols[idx] || '';
            return obj;
          }, {});
        });
        setDbPreview({ headers, data });
        // For download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        setDbDownloadUrl(url);
      }
    } catch (err) {
      setDbError(err.response?.data?.error || 'Error applying transformation to database');
    }
    setIsLoading(false);
  };

  // Helper: Read CSV columns
  const getColumnsFromCSV = (file, cb) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const firstLine = text.split('\n')[0];
      const cols = firstLine.split(',').map((c) => c.trim()).filter(Boolean);
      cb(cols);
    };
    reader.readAsText(file);
  };

  // Step 1: Handle file uploads and column extraction
  const handleSourceFileChange = (event) => {
    const file = event.target.files[0];
    setSourceFile(file);
    setPreview(null);
    setTransformationType(null);
    setError('');
    if (file) getColumnsFromCSV(file, setSourceColumns);
  };
  const handleTargetFileChange = (event) => {
    const file = event.target.files[0];
    setTargetFile(file);
    setPreview(null);
    setTransformationType(null);
    setError('');
    if (file) getColumnsFromCSV(file, setTargetColumns);
  };

  // Helper: Merge source and target into a single CSV
  const mergeCsvFiles = async (sourceFile, targetFile, sourceCol, targetCol) => {
    const readCsv = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          const rows = text.split('\n').filter(row => row.trim());
          const headers = rows[0].split(',').map(h => h.trim());
          const data = rows.slice(1).map(row => {
            const cols = row.split(',').map(c => c.trim());
            return headers.reduce((obj, header, idx) => {
              obj[header] = cols[idx] || '';
              return obj;
            }, {});
          });
          resolve({ headers, data });
        };
        reader.readAsText(file);
      });
    };

    const sourceData = await readCsv(sourceFile);
    const targetData = await readCsv(targetFile);

    if (sourceData.data.length !== targetData.data.length) {
      throw new Error('Source and target files must have the same number of rows.');
    }

    const mergedRows = sourceData.data.map((row, idx) => ({
      source: row[sourceCol] || '',
      target: targetData.data[idx][targetCol] || '',
    }));

    const csvContent = 'source,target\n' + mergedRows.map(row => `${row.source},${row.target}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return new File([blob], 'train.csv', { type: 'text/csv' });
  };

  // Step 1: Learn transformation
  const handleLearn = async () => {
    setIsLoading(true);
    setError('');
    setPreview(null);
    setTransformationType(null);
    if (!sourceFile || !targetFile || !selectedSourceCol || !selectedTargetCol) {
      setError('Please upload both source and target files and select columns.');
      setIsLoading(false);
      return;
    }
    try {
      const trainFile = await mergeCsvFiles(sourceFile, targetFile, selectedSourceCol, selectedTargetCol);
      const formData = new FormData();
      formData.append('train_file', trainFile);
      const response = await axios.post('http://localhost:5000/preview-transform', formData);
      setPreview(response.data);
      setTransformationType(response.data.transformation_type);
    } catch (error) {
      setError(error.response?.data?.error || 'Error generating preview');
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Apply transformation
  const handleApplyFileChange = (event) => {
    const file = event.target.files[0];
    setApplyFile(file);
    if (file) getColumnsFromCSV(file, setApplyColumns);
  };

  const handleApplyPreview = async () => {
    setIsLoading(true);
    setError('');
    setApplyPreview(null);
    if (!sourceFile || !applyFile || !applyCol) {
      setError('Please upload the apply file and select a column.');
      setIsLoading(false);
      return;
    }
    if (!preview) {
      setError('Please wait for the transformation preview.');
      setIsLoading(false);
      return;
    }
    if (preview.type !== 'numeric' && !isPreviewApproved) {
      setError('Please approve the transformation function before proceeding.');
      setIsLoading(false);
      return;
    }
    try {
      const trainFile = await mergeCsvFiles(sourceFile, targetFile, selectedSourceCol, selectedTargetCol);
      const formData = new FormData();
      formData.append('train_file', trainFile);
      formData.append('test_file', applyFile);
      formData.append('transformation_type', transformationType);
      if (preview.type === 'llm') {
        formData.append('approved_function', preview.description);
      }
      const response = await axios.post('http://localhost:5000/preview-apply', formData);
      setApplyPreview(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error generating apply preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    if (!sourceFile || !applyFile) {
      setError('Please upload both source and apply files.');
      setIsLoading(false);
      return;
    }
    if (!preview) {
      setError('Please wait for the transformation preview.');
      setIsLoading(false);
      return;
    }
    if (preview.type !== 'numeric' && !isPreviewApproved) {
      setError('Please approve the transformation function before proceeding.');
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    const trainFile = await mergeCsvFiles(sourceFile, targetFile, selectedSourceCol, selectedTargetCol);
    formData.append('train_file', trainFile);
    formData.append('test_file', applyFile);
    formData.append('transformation_type', transformationType);
    if (preview.type === 'llm') {
      formData.append('approved_function', preview.description);
    }
    try {
      const response = await axios.post('http://localhost:5000/transform', formData, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transformed_output.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage('Transformation successful! File downloaded.');
    } catch (error) {
      setError('Error applying transformation');
    } finally {
      setIsLoading(false);
    }
  };

  // MongoDB: Fetch databases
  const fetchMongoDatabases = async () => {
    setIsLoading(true);
    setMongoError('');
    try {
      const res = await axios.get('http://localhost:5000/api/mongo/databases');
      setMongoDatabases(res.data.databases);
    } catch (err) {
      setMongoError(err.response?.data?.error || 'Error fetching MongoDB databases');
    }
    setIsLoading(false);
  };

  // MongoDB: Fetch collections
  const fetchMongoCollections = async (db) => {
    setSelectedMongoDb(db);
    setMongoCollections([]);
    setSelectedMongoCollection('');
    setMongoPreview(null);
    setMongoTransformedPreview(null);
    setIsLoading(true);
    setMongoError('');
    try {
      const res = await axios.get('http://localhost:5000/api/mongo/collections', { params: { database: db } });
      setMongoCollections(res.data.collections);
    } catch (err) {
      setMongoError(err.response?.data?.error || 'Error fetching collections');
    }
    setIsLoading(false);
  };

  // MongoDB: Preview collection
  const handleMongoCollectionSelect = async (col) => {
    setSelectedMongoCollection(col);
    setMongoPreview(null);
    setMongoTransformedPreview(null);
    setSelectedMongoColumn('');
    setIsLoading(true);
    setMongoError('');
    try {
      const res = await axios.get('http://localhost:5000/api/mongo/preview', { params: { database: selectedMongoDb, collection: col } });
      setMongoPreview(res.data);
    } catch (err) {
      setMongoError(err.response?.data?.error || 'Error fetching collection preview');
    }
    setIsLoading(false);
  };

  // MongoDB: Apply transformation
  const handleMongoApply = async () => {
    setIsLoading(true);
    setMongoError('');
    setMongoSuccess('');
    setMongoTransformedPreview(null);
    try {
      const res = await axios.post('http://localhost:5000/api/mongo/apply_transformation', {
        database: selectedMongoDb,
        collection: selectedMongoCollection,
        column: selectedMongoColumn,
        transformation_type: transformationType,
        function_code: preview?.type === 'llm' ? preview.description : '',
        func_name: preview?.type === 'numeric' ? preview.func_name : '',
        params: preview?.type === 'numeric' ? preview.params : [],
      });
      setMongoTransformedPreview(res.data.preview);
      setMongoSuccess('Transformation applied and stored in transformations DB!');
    } catch (err) {
      setMongoError(err.response?.data?.error || 'Error applying transformation to MongoDB');
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="header">
        <span className="header-title">TabulaX: Smart Data Transformation</span>
        <span className="header-subtitle">Transform your data with AI-powered classification and automation</span>
        {onLogout && (
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        )}
      </div>
      <div className="app-container">
        <div className="layout-row">
          <div className="sidebar">
            <div className="stepper">
              {steps.map((label, idx) => (
                <button
                  key={label}
                  className={`stepper-btn${step === idx ? ' active' : ''}`}
                  onClick={() => setStep(idx)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="content-area">
            {/* Step 1: Learn Transformation */}
            {step === 0 && (
              <div className="fade-step">
                <div>
                  <div className="file-inputs">
                    <div className="file-input">
                      <div className="file-label">Source Data</div>
                      <input type="file" accept=".csv" onChange={handleSourceFileChange} />
                      {sourceColumns.length > 0 && (
                        <select value={selectedSourceCol} onChange={e => setSelectedSourceCol(e.target.value)}>
                          <option value="">Select source column</option>
                          {sourceColumns.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="file-input">
                      <div className="file-label">Target Data</div>
                      <input type="file" accept=".csv" onChange={handleTargetFileChange} />
                      {targetColumns.length > 0 && (
                        <select value={selectedTargetCol} onChange={e => setSelectedTargetCol(e.target.value)}>
                          <option value="">Select target column</option>
                          {targetColumns.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                  <button
                    className="transform-button"
                    onClick={handleLearn}
                    disabled={!sourceFile || !targetFile || !selectedSourceCol || !selectedTargetCol || isLoading}
                  >
                    {isLoading ? 'Analyzing...' : 'Learn Transformation'}
                  </button>
                  {error && <div className="error-message">{error}</div>}
                  {preview && (
                    <div className="preview-section">
                      <div className="preview-label">Classification: <span className="preview-type">{preview.transformation_type}</span></div>
                      <div className="preview-desc">Transformation Function:</div>
                      <pre className="preview-content">{preview.description}</pre>
                      <div className="preview-desc mt">Example Transformations:</div>
                      <table>
                        <thead>
                          <tr>
                            <th>Input</th>
                            <th>Expected</th>
                            <th>Predicted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.examples.map((ex, idx) => (
                            <tr key={idx}>
                              <td>{ex.input}</td>
                              <td>{ex.expected}</td>
                              <td>{ex.predicted}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {preview.type === 'llm' && (
                        <button
                          className="approve-button"
                          onClick={() => setIsPreviewApproved(true)}
                          disabled={isPreviewApproved}
                        >
                          {isPreviewApproved ? 'Approved' : 'Approve Transformation'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Apply Transformation */}
            {step === 1 && (
              <div className="fade-step">
                <div>
                  <div className="preview-section">
                    <div className="file-label">Data to Transform (CSV)</div>
                    <input type="file" onChange={handleApplyFileChange} />
                    {applyColumns.length > 0 && (
                      <select value={applyCol} onChange={e => setApplyCol(e.target.value)}>
                        <option value="">Select column to transform</option>
                        {applyColumns.map(col => <option key={col} value={col}>{col}</option>)}
                      </select>
                    )}
                    <div className="button-row">
                      <button
                        className="transform-button"
                        onClick={handleApplyPreview}
                        disabled={!applyFile || !applyCol || isLoading}
                      >
                        {isLoading ? 'Loading...' : 'Preview'}
                      </button>
                      <button
                        className="transform-button"
                        onClick={handleApply}
                        disabled={isLoading}
                      >
                        Apply Transformation
                      </button>
                    </div>
                    {applyPreview && (
                      <div className="preview-section">
                        <div className="preview-desc">Preview of Transformed Data:</div>
                        <table>
                          <thead>
                            <tr>
                              <th>Input</th>
                              <th>Predicted</th>
                            </tr>
                          </thead>
                          <tbody>
                            {applyPreview.examples.map((ex, idx) => (
                              <tr key={idx}>
                                <td>{ex.input}</td>
                                <td>{ex.predicted}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {message && <div className="success-message">{message}</div>}
                    {error && <div className="error-message">{error}</div>}
                  </div>
                  <button
                    className="transform-button"
                    onClick={() => setStep(2)}
                  >
                    Next: Connect to Database
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Connect to MySQL */}
            {step === 2 && (
              <div className="fade-step">
                <div className="preview-section">
                  <form onSubmit={handleMysqlPasswordSubmit} className="mysql-form">
                    <div className="file-label">MySQL Password (localhost)</div>
                    <input
                      type="password"
                      value={mysqlPassword}
                      onChange={e => setMysqlPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                    <button
                      className="transform-button"
                      type="submit"
                      disabled={isLoading || !mysqlPassword}
                    >
                      {isLoading ? 'Connecting...' : 'Connect'}
                    </button>
                  </form>
                  {dbError && <div className="error-message">{dbError}</div>}
                  {databases.length > 0 && (
                    <div>
                      <div className="file-label">Select Database</div>
                      <select
                        value={selectedDatabase}
                        onChange={e => handleDatabaseSelect(e.target.value)}
                      >
                        <option value="">Select database</option>
                        {databases.map(db => (
                          <option key={db} value={db}>{db}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {tables.length > 0 && (
        <div>
                      <div className="file-label">Select Table</div>
                      <select
                        value={selectedTable}
                        onChange={e => handleTableSelect(e.target.value)}
                      >
                        <option value="">Select table</option>
                        {tables.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
        </div> 
                  )}
                  {columns.length > 0 && (
        <div>
                      <div className="file-label">Select Column</div>
                      <select
                        value={selectedColumn}
                        onChange={e => handleColumnSelect(e.target.value)}
                      >
                        <option value="">Select column</option>
                        {columns.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {tablePreview && (
                    <div className="preview-section">
                      <div className="preview-desc">Table Preview:</div>
                      <table>
                        <thead>
                          <tr>
                            {tablePreview.headers.map((header, idx) => (
                              <th key={idx}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tablePreview.data.map((row, idx) => (
                            <tr key={idx}>
                              {tablePreview.headers.map((header, hIdx) => (
                                <td key={hIdx}>{row[header]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button
                        className="transform-button"
                        onClick={handleDbApply}
                        disabled={!selectedColumn || isLoading || !preview}
                      >
                        {isLoading ? 'Applying...' : 'Apply Transformation'}
                      </button>
                    </div>
                  )}
                  {dbPreview && (
                    <div className="preview-section">
                      <div className="preview-desc">Transformed Table Preview:</div>
                      <table>
                        <thead>
                          <tr>
                            {dbPreview.headers.map((header, idx) => (
                              <th key={idx}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dbPreview.data.map((row, idx) => (
                            <tr key={idx}>
                              {dbPreview.headers.map((header, hIdx) => (
                                <td key={hIdx}>{row[header]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="success-message" style={{marginTop: '1rem'}}>Transformation done. Table updated to transformations database.</div>
                    </div>
                  )}
                  {dbDownloadUrl && (
                    <a href={dbDownloadUrl} download={`${selectedTable}_transformed.csv`} className="transform-button">Download</a>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Connect to MongoDB */}
            {step === 3 && (
              <div className="fade-step">
                <div className="preview-section">
                  <h2 className="section-title">Connect to MongoDB</h2>
                  <button className="transform-button" onClick={fetchMongoDatabases} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Fetch Databases'}
                  </button>
                  {mongoError && <div className="error-message">{mongoError}</div>}
                  {mongoDatabases.length > 0 && (
                    <div>
                      <div className="file-label">Select Database</div>
                      <select value={selectedMongoDb} onChange={e => fetchMongoCollections(e.target.value)}>
                        <option value="">Select database</option>
                        {mongoDatabases.map(db => (
                          <option key={db} value={db}>{db}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {mongoCollections.length > 0 && (
                    <div>
                      <div className="file-label">Select Collection</div>
                      <select value={selectedMongoCollection} onChange={e => handleMongoCollectionSelect(e.target.value)}>
                        <option value="">Select collection</option>
                        {mongoCollections.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {mongoPreview && (
                    <div className="preview-section">
                      <div className="preview-desc">Collection Preview:</div>
                      <table>
                        <thead>
                          <tr>
                            {mongoPreview.headers.map((header, idx) => (
                              <th key={idx}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {mongoPreview.data.map((row, idx) => (
                            <tr key={idx}>
                              {mongoPreview.headers.map((header, hIdx) => (
                                <td key={hIdx}>{row[header]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Column selection dropdown */}
                      <div style={{ margin: '1.2rem 0' }}>
                        <div className="file-label">Select Column to Transform</div>
                        <select value={selectedMongoColumn} onChange={e => setSelectedMongoColumn(e.target.value)}>
                          <option value="">Select column</option>
                          {mongoPreview.headers.filter(h => h !== '_id').map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="transform-button"
                        onClick={handleMongoApply}
                        disabled={!selectedMongoCollection || !selectedMongoColumn || isLoading || !preview}
                      >
                        {isLoading ? 'Applying...' : 'Apply Transformation'}
                      </button>
                    </div>
                  )}
                  {mongoTransformedPreview && (
                    <div className="preview-section">
                      <div className="preview-desc">Transformed Collection Preview:</div>
                      <table>
                        <thead>
                          <tr>
                            {mongoTransformedPreview.headers.map((header, idx) => (
                              <th key={idx}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {mongoTransformedPreview.data.map((row, idx) => (
                            <tr key={idx}>
                              {mongoTransformedPreview.headers.map((header, hIdx) => (
                                <td key={hIdx}>{row[header]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {mongoSuccess && <div className="success-message">{mongoSuccess}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
    </>
  );
}