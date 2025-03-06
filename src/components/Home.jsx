import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
  });
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    description: '',
    amount: '',
    category: '',
  });
  const navigate = useNavigate();

  // Fetch user data and expenses on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userResponse = await fetch('http://localhost:4000/api/v1/user/me', {
          method: 'GET',
          credentials: 'include',
        });
        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.message || 'Failed to fetch user data');
        }
        const userData = await userResponse.json();
        if (userData.success) setUser(userData.user);
        else throw new Error(userData.message || 'User fetch failed');

        const expensesResponse = await fetch('http://localhost:4000/api/v1/expense/getall', {
          method: 'GET',
          credentials: 'include',
        });
        if (!expensesResponse.ok) {
          const errorData = await expensesResponse.json();
          throw new Error(errorData.message || 'Failed to fetch expenses');
        }
        const expensesData = await expensesResponse.json();
        if (expensesData.success) setExpenses(expensesData.expenses);
        else throw new Error(expensesData.message || 'Expenses fetch failed');
      } catch (err) {
        setError(err.message);
        if (err.message.includes('Unauthorized') || err.message.includes('not authenticated')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Handle form input changes for adding
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form input changes for editing
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    const newExpense = {
      description: formData.description,
      amount: Number(formData.amount) || 0,
      category: formData.category,
    };

    try {
      setError(null);
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/v1/expense/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newExpense),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add expense');
      }
      const data = await response.json();
      if (data.success) {
        console.log('Backend response:', data); // Log full response
        console.log('New expense:', data.expense); // Log expense object
        const formattedExpense = {
          ...data.expense,
          description: data.expense.description || newExpense.description, // Use form data if missing
          amount: Number(data.expense.amount) || newExpense.amount, // Ensure number
          category: data.expense.category || newExpense.category, // Use form data if missing
          createdAt: data.expense.createdAt || new Date().toISOString(),
        };
        console.log('Formatted expense:', formattedExpense); // Log final formatted data
        setExpenses((prev) => [formattedExpense, ...prev]);
        setFormData({ description: '', amount: '', category: '' });
      } else {
        throw new Error(data.message || 'Expense addition failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing an expense
  const handleEditExpense = (expense) => {
    setEditId(expense._id);
    setEditFormData({
      description: expense.description || '',
      amount: Number(expense.amount) || 0,
      category: expense.category || '',
    });
  };

  // Handle updating an expense
  const handleUpdateExpense = async (e, id) => {
    e.preventDefault();
    const updatedExpense = {
      description: editFormData.description,
      amount: Number(editFormData.amount) || 0,
      category: editFormData.category,
    };

    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/v1/expense/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedExpense),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update expense');
      }
      const data = await response.json();
      if (data.success) {
        setExpenses((prev) =>
          prev.map((exp) => (exp._id === id ? { ...data.expense, amount: Number(data.expense.amount) || 0 } : exp))
        );
        setEditId(null);
      } else {
        throw new Error(data.message || 'Expense update failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/v1/expense/remove/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete expense');
      }
      const data = await response.json();
      if (data.success) {
        setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      } else {
        throw new Error(data.message || 'Expense deletion failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/v1/user/logout', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) navigate('/login');
      else throw new Error('Logout failed');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total expenses with fallback for invalid amounts
  const totalExpenses = expenses.reduce((sum, exp) => {
    const amount = Number(exp.amount) || 0;
    return sum + Math.abs(amount);
  }, 0);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.fullname || 'User'}!
            </h1>
            <p className="mt-2 text-lg text-gray-600">Manage your expenses below</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={loading}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
        )}

        {/* Summary Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-700">Total Expenses</h3>
              <p className="mt-2 text-2xl font-bold text-red-600">₹{totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-700">Transaction Count</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">{expenses.length}</p>
            </div>
          </div>
        </section>

        {/* Add Expense Form */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Add New Expense</h2>
          <form onSubmit={handleAddExpense} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Groceries"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 50.00"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Food"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </section>

        {/* Recent Expenses */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Expenses</h2>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : expenses.length === 0 ? (
            <p className="text-center text-gray-600">No expenses yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp._id || Math.random()} className="border-t hover:bg-gray-50">
                      {editId === exp._id ? (
                        <form onSubmit={(e) => handleUpdateExpense(e, exp._id)} className="contents">
                          <td className="px-6 py-4">
                            <label htmlFor={`edit-description-${exp._id}`} className="sr-only">
                              Description
                            </label>
                            <input
                              id={`edit-description-${exp._id}`}
                              name="description"
                              type="text"
                              value={editFormData.description}
                              onChange={handleEditInputChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                              placeholder="e.g., Groceries"
                              required
                              disabled={loading}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <label htmlFor={`edit-amount-${exp._id}`} className="sr-only">
                              Amount
                            </label>
                            <input
                              id={`edit-amount-${exp._id}`}
                              name="amount"
                              type="number"
                              step="0.01"
                              value={editFormData.amount}
                              onChange={handleEditInputChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                              placeholder="e.g., 50.00"
                              required
                              min="0"
                              disabled={loading}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <label htmlFor={`edit-category-${exp._id}`} className="sr-only">
                              Category
                            </label>
                            <input
                              id={`edit-category-${exp._id}`}
                              name="category"
                              type="text"
                              value={editFormData.category}
                              onChange={handleEditInputChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                              placeholder="e.g., Food"
                              required
                              disabled={loading}
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(exp.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 flex space-x-2">
                            <button
                              type="submit"
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              disabled={loading}
                            >
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditId(null)}
                              className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </td>
                        </form>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">{exp.description}</td>
                          <td className="px-6 py-4 text-sm font-medium text-red-600">
                            ₹{(Number(exp.amount) || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{exp.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(exp.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 flex space-x-2">
                            <button
                              onClick={() => handleEditExpense(exp)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;