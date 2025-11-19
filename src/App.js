import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import './App.css';

Amplify.configure(awsExports);

// --- CONFIGURATION ---
const API_URL = 'https://ait7emkdle.execute-api.eu-north-1.amazonaws.com/prod/items'; // <-- PASTE YOUR URL HERE

function App({ signOut, user }) {
  // Navigation State
  const [currentView, setCurrentView] = useState('add'); // Options: 'add' or 'list'

  // Form State
  const [itemName, setItemName] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [itemStatus, setItemStatus] = useState('In Stock');
  const [statusMessage, setStatusMessage] = useState("");

  // Inventory Data State
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Function
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
        const response = await fetch(API_URL, { method: 'GET' });
        const data = await response.json();

        console.log("DEBUG - API Response:", data); // <--- THIS IS KEY

        // Check if data is actually an array (list)
        if (Array.isArray(data)) {
            const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setInventory(sorted);
        } else {
            // If it's not an array, it's likely an error object
            console.error("API Error:", data);
            setStatusMessage(`⚠️ System Error: ${data.message || JSON.stringify(data)}`);
        }
    } catch (error) {
        console.error("Network Error:", error);
        setStatusMessage("❌ Critical Network Error");
    } finally {
        setIsLoading(false);
    }
  };

  // Auto-fetch when switching to "View Inventory" tab
  useEffect(() => {
    if (currentView === 'list') {
      fetchInventory();
    }
  }, [currentView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("Logging item...");

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item: itemName, location: itemLocation, status: itemStatus })
        });
        
        setStatusMessage(`✅ Logged: ${itemName}`);
        setItemName('');
        setItemLocation('');
    } catch (error) {
        console.error('Error:', error);
        setStatusMessage("❌ Error logging item.");
    }
  };

  return (
    <div className="app-container" style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* --- MENU BAR --- */}
      <div className="menu-bar">
        <button 
          className={`menu-btn ${currentView === 'add' ? 'active' : ''}`} 
          onClick={() => setCurrentView('add')}
        >
          ➕ Add Item
        </button>
        <button 
          className={`menu-btn ${currentView === 'list' ? 'active' : ''}`} 
          onClick={() => setCurrentView('list')}
        >
          📋 View Inventory
        </button>
      </div>

      {/* --- VIEW 1: ADD ITEM FORM --- */}
      {currentView === 'add' && (
        <div className="card">
          <h1>Log New Item</h1>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Item Name</label>
              <input 
                placeholder="e.g. Drill Press" 
                value={itemName} 
                onChange={(e) => setItemName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Location</label>
              <input 
                placeholder="e.g. Shelf A2" 
                value={itemLocation} 
                onChange={(e) => setItemLocation(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Status</label>
              <select 
                value={itemStatus} 
                onChange={(e) => setItemStatus(e.target.value)} 
                style={{ width: '100%', padding: '10px' }}
              >
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
                <option>Needs Repair</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">Submit Log</button>
          </form>
          <p style={{marginTop: '15px', textAlign:'center', fontWeight:'bold'}}>{statusMessage}</p>
        </div>
      )}

      {/* --- VIEW 2: INVENTORY LIST --- */}
      {currentView === 'list' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'15px' }}>
              <h2 style={{margin:0}}>Inventory List</h2>
              <button onClick={fetchInventory} style={{ padding: '8px 12px', cursor: 'pointer', background:'#f3f4f6', border:'none', borderRadius:'6px' }}>↻ Refresh</button>
          </div>
          
          {isLoading ? <p style={{textAlign:'center'}}>Loading data...</p> : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                          <th style={{ padding: '10px' }}>Item</th>
                          <th style={{ padding: '10px' }}>Loc</th>
                          <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {inventory.length === 0 ? (
                        <tr><td colSpan="3" style={{padding:'20px', textAlign:'center', color:'#999'}}>No items found.</td></tr>
                      ) : inventory.map((row) => (
                          <tr key={row.reportID} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '12px 10px', fontWeight: 'bold', color:'#1f2937' }}>{row.name}</td>
                              <td style={{ padding: '12px 10px', color:'#4b5563' }}>{row.location}</td>
                              <td style={{ padding: '12px 10px' }}>
                                  <span style={{ 
                                      backgroundColor: row.status === 'In Stock' ? '#def7ec' : (row.status === 'Out of Stock' ? '#fde8e8' : '#fff8d1'),
                                      color: row.status === 'In Stock' ? '#03543f' : (row.status === 'Out of Stock' ? '#9b1c1c' : '#92400e'),
                                      padding: '4px 8px', borderRadius: '99px', fontSize: '12px', fontWeight:'bold', whiteSpace:'nowrap'
                                  }}>
                                      {row.status}
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          )}
        </div>
      )}
      
      <div style={{textAlign:'center', marginTop:'30px'}}>
        <button onClick={signOut} style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer', textDecoration:'underline' }}>Sign Out</button>
      </div>
    </div>
  );
}

export default withAuthenticator(App);