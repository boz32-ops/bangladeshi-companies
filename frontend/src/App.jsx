
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/companies';

function App() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    sector: '',
    headquarter: '',
    founded: '',
    logo: '',
  });

  // MongoDB থেকে company-র data আনা
  const fetchCompanies = async () => {
    try {
      const response = await axios.get(API_URL);
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      alert('Backend থেকে data আনা যায়নি। Server চালু আছে কি না দেখো।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Search
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.sector.toLowerCase().includes(search.toLowerCase())
  );

  // Demo Admin Login
  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin123') {
      setIsAdmin(true);
      setShowLogin(false);
      setUsername('');
      setPassword('');
    } else {
      alert('Wrong username or password!');
    }
  };

  // Form input পরিবর্তন
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Company Add অথবা Update
  const handleSaveCompany = async (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.sector.trim() ||
      !form.headquarter.trim() ||
      !form.founded.trim()
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const companyData = {
        ...form,
        logo: form.logo.trim(),
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, companyData);
        alert('Company updated successfully!');
      } else {
        await axios.post(API_URL, companyData);
        alert('Company added successfully!');
      }

      handleCancelEdit();
      await fetchCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
      alert(
        error.response?.data?.message ||
        'Company save করা যায়নি। Backend check করো।'
      );
    }
  };

  // Edit button
  const handleEdit = (company) => {
    setForm({
      name: company.name || '',
      sector: company.sector || '',
      headquarter: company.headquarter || '',
      founded: company.founded || '',
      logo: company.logo || '',
    });

    setEditingId(company._id);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Delete button
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this company?'
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      await fetchCompanies();
      alert('Company deleted successfully!');
    } catch (error) {
      console.error('Error deleting company:', error);
      alert(
        error.response?.data?.message ||
        'Company delete করা যায়নি।'
      );
    }
  };

  // Form reset
  const handleCancelEdit = () => {
    setEditingId(null);

    setForm({
      name: '',
      sector: '',
      headquarter: '',
      founded: '',
      logo: '',
    });
  };

  // Logout
  const handleLogout = () => {
    setIsAdmin(false);
    handleCancelEdit();
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Top Bangladeshi Companies</h1>

        {isAdmin ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <button onClick={() => setShowLogin(!showLogin)}>
            Admin Login
          </button>
        )}
      </header>

      {/* Admin Login */}
      {showLogin && !isAdmin && (
        <form className="form-box" onSubmit={handleLogin}>
          <h2>Admin Login</h2>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>

          <p>Demo: admin / admin123</p>
        </form>
      )}

      {/* Add / Edit Company Form */}
      {isAdmin && (
        <form className="form-box" onSubmit={handleSaveCompany}>
          <h2>
            {editingId !== null ? 'Edit Company' : 'Add New Company'}
          </h2>

          <input
            name="name"
            placeholder="Company Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="sector"
            placeholder="Industry / Sector"
            value={form.sector}
            onChange={handleChange}
            required
          />

          <input
            name="headquarter"
            placeholder="Headquarter"
            value={form.headquarter}
            onChange={handleChange}
            required
          />

          <input
            name="founded"
            placeholder="Founded Year"
            value={form.founded}
            onChange={handleChange}
            required
          />

          <input
            name="logo"
            placeholder="Logo URL (optional)"
            value={form.logo}
            onChange={handleChange}
          />

          <button type="submit">
            {editingId !== null ? 'Update Company' : 'Add Company'}
          </button>

          {editingId !== null && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel Edit
            </button>
          )}
        </form>
      )}

      {/* Search */}
      <input
        className="search"
        type="text"
        placeholder="Search by company or industry..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Company List */}
      {loading ? (
        <p>Loading companies...</p>
      ) : (
        <div className="company-list">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <div className="company-card" key={company._id}>
                {company.logo && (
                  <img
                    src={company.logo}
                    alt={company.name}
                  />
                )}

                <h2>{company.name}</h2>

                <p>
                  <strong>Industry:</strong> {company.sector}
                </p>

                <p>
                  <strong>Headquarter:</strong>{' '}
                  {company.headquarter}
                </p>

                <p>
                  <strong>Founded:</strong> {company.founded}
                </p>

                {isAdmin && (
                  <div className="actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(company)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() => handleDelete(company._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No companies found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
