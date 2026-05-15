import { useState } from 'react'
import './App.css'

function App() {
  //KATA 1: DICTIONARY
  const [addWord, setAddWord] = useState('');
  const [addDef, setAddDef] = useState('');
  const [searchWord, setSearchWord] = useState('');
  const [dictOutput, setDictOutput] = useState('');
  const [dictList, setDictList] = useState(null); // New state for formatted table

  // KATA 2: CALCULATOR 
  const [boughtItems, setBoughtItems] = useState(''); // Removed default value
  const [taxRate, setTaxRate] = useState('0.16'); // Standard VAT example
  const [calcResult, setCalcResult] = useState('');

  // KATA 3: CONCATENATOR 
  const [wordsList, setWordsList] = useState('');
  const [concatResult, setConcatResult] = useState('');

  // - FUNCTIONS KATA 1 -
  const handleAddWord = async () => {
    if (!addWord || !addDef) return setDictOutput("Please fill in both fields.");
    setDictOutput("Saving to cloud database...");
    try {
      const res = await fetch('/api/v1/dictionary/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: addWord, definition: addDef })
      });
      const data = await res.json();
      setDictOutput(`[+] ${data.message || "Entry saved successfully"}`);
      setAddWord(''); setAddDef('');
      setDictList(null); // Clear table to force refresh next time
    } catch (error) {
      setDictOutput("Connection error while saving.");
    }
  };

  const handleSearchWord = async () => {
    if (!searchWord) return setDictOutput("Please enter a word to search.");
    setDictOutput("Searching...");
    setDictList(null); // Hide table if searching
    try {
      const res = await fetch(`/api/v1/dictionary/look/${searchWord}`);
      const data = await res.json();
      if (res.ok) {
        setDictOutput(`Word: ${data.word}\nDefinition: ${data.definition}\nDevice: ${data.metadata.device}`);
      } else {
        setDictOutput(`Error: ${data.detail}`);
      }
    } catch (error) {
      setDictOutput("Error looking up the word.");
    }
  };

  const handleViewAll = async () => {
    setDictOutput("Querying database records...");
    try {
      const res = await fetch('/api/v1/dictionary/all');
      const data = await res.json();
      if (data.dictionary) {
        setDictOutput(""); 
        setDictList(data.dictionary); // Populate table 
      } else {
        setDictOutput(JSON.stringify(data));
      }
    } catch (error) {
      setDictOutput("Error fetching the dictionary.");
    }
  };

  // - FUNCTIONS KATA 2 -
  const runCalculator = async () => {
    if (!boughtItems) return setCalcResult("Please enter items to buy.");
    setCalcResult("Calculating in AWS...");
    try {
      const itemsArray = boughtItems.split(',').map(item => item.trim());
      
      const storeCosts = {
        "socks": 5.0, "shoes": 60.0, "sweater": 30.0,
        "laptop": 1200.0, "mouse": 25.5, "keyboard": 75.0,
        "monitor": 300.0, "coffee": 4.5, "backpack": 45.0,
        "headphones": 150.0, "desk": 250.0, "chair": 180.0,
        "cable": 15.0
      };

      const response = await fetch('/api/v1/costs/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          costs: storeCosts, 
          items: itemsArray, 
          tax: parseFloat(taxRate) || 0 
        })
      });
      
      const data = await response.json();
      setCalcResult(data.total_cost !== undefined ? `Output: $${data.total_cost}` : "Calculation error");
    } catch (error) {
      setCalcResult("Connection error.");
    }
  };

  // - FUNCTIONS KATA 3 -
  const runConcatenator = async () => {
    if (!wordsList) return setConcatResult("Please enter a list of words.");
    
    const arrayPalabras = wordsList.split(',').map(w => w.trim()).filter(w => w !== '');
    
    //Checks if words meet the length requirement
    for (let i = 0; i < arrayPalabras.length; i++) {
      if (arrayPalabras[i].length <= i) {
        setConcatResult(`⚠️ Warning: Input rejected. The word "${arrayPalabras[i]}" at index [${i}] is too short. It needs more than ${i} characters to process.`);
        return; // Stop execution before hitting the backend
      }
    }

    setConcatResult("Processing in AWS...");
    try {
      const response = await fetch('/api/v1/strings/concat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: arrayPalabras })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "API Request Failed");
      }
      const data = await response.json();
      setConcatResult(`API Response: ${data.result}`);
    } catch (error) {
      setConcatResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>KataOps Engine</h1>
        <p style={{color: '#dbe4f3'}}>Technical demonstration for: EPAM Systems: Cloud & DevOps Specialization Course</p>
        <p style={{color: '#9ca3af'}}>Created by: Nestor David Reyes Quinones</p>
      </header>

      <div className="kata-grid">
        
        {/* KATA 1: DICTIONARY */}
        <div className="card">
          <div className="card-header">
            <span className="tag">Kata #1</span>
            <h3>Dictionary System</h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5', marginTop: '10px' }}>
              <strong>The challenge: </strong> Create a Python algorithm that takes a key (word) and a value (definition) and safely inserts them into an in-memory dictionary, validating that no empty data exists.
            </p>
          </div>
          <div className="interactive-area" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '10px', background: '#1e293b', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#9ca3af' }}>1. ADD ELEMENT</h4>
              <div className="input-group">
                <input placeholder="Word (e.g. Jenkins)" value={addWord} onChange={e => setAddWord(e.target.value)} />
                <input placeholder="Definition..." value={addDef} onChange={e => setAddDef(e.target.value)} />
              </div>
              <button className="btn-exec" onClick={handleAddWord} style={{ marginTop: '10px' }}>Save Entry</button>
            </div>
            <div style={{ padding: '10px', background: '#1e293b', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#9ca3af' }}>2. SEARCH ELEMENT</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input placeholder="Word to search..." value={searchWord} onChange={e => setSearchWord(e.target.value)} style={{ flex: 1 }} />
                <button className="btn-exec" onClick={handleSearchWord}>Search</button>
              </div>
            </div>
            <div style={{ padding: '10px', background: '#1e293b', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#9ca3af' }}>3. GENERAL STATE</h4>
              <button className="btn-exec" onClick={handleViewAll} style={{ width: '100%' }}>View Entire Dictionary</button>
            </div>
            
            {/* Conditional Rendering for text output or table */}
            {dictOutput && (
              <pre className="result-box" style={{ whiteSpace: 'pre-wrap', textAlign: 'left', margin: 0 }}>
                {dictOutput}
              </pre>
            )}

            {/* Formatted output */}
            {dictList && (
              <div style={{ marginTop: '10px', overflowX: 'auto', background: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155' }}>
                      <th style={{ padding: '8px' }}>Word</th>
                      <th style={{ padding: '8px' }}>Definition</th>
                      <th style={{ padding: '8px' }}>Client Device</th>
                      <th style={{ padding: '8px' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(dictList).map(([word, details]) => (
                      <tr key={word} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '8px', color: '#818cf8', fontWeight: 'bold' }}>{word}</td>
                        <td style={{ padding: '8px' }}>{details.definition}</td>
                        <td style={{ padding: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>{details.device}</td>
                        <td style={{ padding: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(details.added_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* KATA 2: CALCULATOR */}
        <div className="card">
          <div className="card-header">
            <span className="tag">Kata #2</span>
            <h3>Tax Calculator</h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5', marginTop: '10px' }}>
              <strong>The challenge:</strong> Given a dictionary of items and their costs and an array specifying the items bought, calculate the total cost plus a given tax. Ignore non-existent items.
            </p>
          </div>
          <div className="interactive-area">
            
            <div style={{ padding: '10px', background: '#1e293b', borderRadius: '8px', marginBottom: '15px', textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#9ca3af' }}>Store Catalog (Dictionary)</h4>
              <code style={{ color: '#a5b4fc', fontSize: '0.8rem', display: 'block', whiteSpace: 'pre-wrap' }}>
                costs = {"{"} <br/>
                &nbsp;&nbsp;'socks': 5.0, 'shoes': 60.0, 'sweater': 30.0, <br/>
                &nbsp;&nbsp;'laptop': 1200.0, 'mouse': 25.5, 'keyboard': 75.0, <br/>
                &nbsp;&nbsp;'monitor': 300.0, 'coffee': 4.5, 'backpack': 45.0, <br/>
                &nbsp;&nbsp;'headphones': 150.0, 'desk': 250.0, 'chair': 180.0, <br/>
                &nbsp;&nbsp;'cable': 15.0 <br/>
                {"}"}
              </code>
            </div>

            <div className="input-group">
              <input 
                type="text" 
                placeholder="Items to buy (e.g. laptop, coffee, desk)" 
                value={boughtItems} 
                onChange={e => setBoughtItems(e.target.value)} 
              />
              <input 
                type="number" 
                step="0.01" 
                placeholder="Tax Rate (e.g. 0.16)" 
                value={taxRate} 
                onChange={e => setTaxRate(e.target.value)} 
              />
            </div>
            <button className="btn-exec" onClick={runCalculator} style={{ marginTop: '10px' }}>Calculate Total</button>
            {calcResult && (
              <div className="result-box" style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                {calcResult}
              </div>
            )}
          </div>
        </div>

        {/* KATA 3: CONCATENATOR */}
        <div className="card">
          <div className="card-header">
            <span className="tag">Kata #3</span>
            <h3>Pattern Concatenator</h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5', marginTop: '10px' }}>
              <strong>The challenge: </strong>Write a script that takes a comma-separated string, converts it into a list, iterates through it to extract specific letters based on a pattern, and returns the final string. 
            </p>
          </div>
          <div className="interactive-area">
            <input 
              placeholder="e.g: yoda, best, has" 
              value={wordsList} 
              onChange={e => setWordsList(e.target.value)} 
            />
            <button className="btn-exec" onClick={runConcatenator} style={{ marginTop: '10px' }}>Extract Pattern</button>
            {concatResult && <div className="result-box">{concatResult}</div>}
          </div>
        </div>

      </div>
    </div>
  )
}

export default App