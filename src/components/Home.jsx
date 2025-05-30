import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
  });
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    description: "",
    amount: "",
    category: "",
  });
  const navigate = useNavigate();

  // Fetch user data and expenses on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch user
        const userResponse = await fetch(
          "https://expensetracker-server-644u.onrender.com/api/v1/user/me",
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        const userData = await userResponse.json();
        console.log(userData, "User Data");

        if (!userResponse.ok) {
          throw new Error(userData.message || "Failed to fetch user data");
        }

        if (userData.success) setUser(userData.user);
        else throw new Error(userData.message || "User fetch failed");

        // Fetch expenses
        const expensesResponse = await fetch(
          "https://expensetracker-server-644u.onrender.com/api/v1/expense/getall",
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        const expensesData = await expensesResponse.json();
        console.log(expensesData, "Expenses Data");

        if (!expensesResponse.ok) {
          throw new Error(expensesData.message || "Failed to fetch expenses");
        }

        if (expensesData.success) setExpenses(expensesData.expenses);
        else throw new Error(expensesData.message || "Expenses fetch failed");
      } catch (err) {
        console.error("Error:", err.message);
        setError(err.message);
        if (
          err.message.includes("Unauthorized") ||
          err.message.includes("not authenticated")
        ) {
          navigate("/");
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
      const response = await fetch(
        "https://expensetracker-server-644u.onrender.com/api/v1/expense/add",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newExpense),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add expense");
      }

      const data = await response.json();
      if (data.success) {
        console.log("Backend response:", data);
        console.log("New expense:", data.expense);
        const formattedExpense = {
          ...data.expense,
          description: data.expense.description || newExpense.description,
          amount: Number(data.expense.amount) || newExpense.amount,
          category: data.expense.category || newExpense.category,
          createdAt: data.expense.createdAt || new Date().toISOString(),
        };
        console.log("Formatted expense:", formattedExpense);
        setExpenses((prev) => [formattedExpense, ...prev]);
        setFormData({ description: "", amount: "", category: "" });
      } else {
        throw new Error(data.message || "Expense addition failed");
      }
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message);
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("not authenticated")
      ) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle editing an expense
  const handleEditExpense = (expense) => {
    setEditId(expense._id);
    setEditFormData({
      description: expense.description || "",
      amount: Number(expense.amount) || 0,
      category: expense.category || "",
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
      const response = await fetch(
        `https://expensetracker-server-644u.onrender.com/api/v1/expense/update/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedExpense),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update expense");
      }

      const data = await response.json();
      if (data.success) {
        setExpenses((prev) =>
          prev.map((exp) =>
            exp._id === id
              ? { ...data.expense, amount: Number(data.expense.amount) || 0 }
              : exp
          )
        );
        setEditId(null);
      } else {
        throw new Error(data.message || "Expense update failed");
      }
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message);
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("not authenticated")
      ) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      setError(null);
      setLoading(true);
      const response = await fetch(
        `https://expensetracker-server-644u.onrender.com/api/v1/expense/remove/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete expense");
      }

      const data = await response.json();
      if (data.success) {
        setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      } else {
        throw new Error(data.message || "Expense deletion failed");
      }
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message);
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("not authenticated")
      ) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://expensetracker-server-644u.onrender.com/api/v1/user/logout",
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        navigate("/");
      } else {
        throw new Error("Logout failed");
      }
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message);
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("not authenticated")
      ) {
        navigate("/");
      }
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
    <div className="bg-black min-h-screen text-gray-300">
      {/* Header */}
      <header className="bg-gray-900 py-4 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome, {user?.fullname || "User"}!
            </h1>
            <p className="mt-1 text-base sm:text-lg text-gray-400">
              Manage your expenses below
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Summary Section */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
            Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-medium text-gray-300">
                Total Expenses
              </h3>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-red-500">
                ₹{totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-medium text-gray-300">
                Transaction Count
              </h3>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-white">
                {expenses.length}
              </p>
            </div>
          </div>
        </section>

        {/* Add Expense Form */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
            Add New Expense
          </h2>
          <form
            onSubmit={handleAddExpense}
            className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-400"
                >
                  Description
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-300 text-sm sm:text-base"
                  placeholder="e.g., Groceries"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-400"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-300 text-sm sm:text-base"
                  placeholder="e.g., 50.00"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-400"
                >
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-300 text-sm sm:text-base"
                  placeholder="e.g., Food"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </section>

        {/* Edit Expense Form */}
        {editId && (
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
              Edit Expense
            </h2>
            <form
              onSubmit={(e) => handleUpdateExpense(e, editId)}
              className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="edit-description"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Description
                  </label>
                  <input
                    id="edit-description"
                    name="description"
                    type="text"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-300 text-sm sm:text-base"
                    placeholder="e.g., Groceries"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-amount"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Amount
                  </label>
                  <input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={editFormData.amount}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-300 text-sm sm:text-base"
                    placeholder="e.g., 50.00"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-category"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Category
                  </label>
                  <input
                    id="edit-category"
                    name="category"
                    type="text"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-300 text-sm sm:text-base"
                    placeholder="e.g., Food"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Expense"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm sm:text-base"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Recent Expenses */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
            Recent Expenses
          </h2>
          {loading ? (
            <p className="text-center text-gray-400 text-sm sm:text-base">
              Loading...
            </p>
          ) : expenses.length === 0 ? (
            <p className="text-center text-gray-400 text-sm sm:text-base">
              No expenses yet.
            </p>
          ) : (
            <>
              {/* Table for larger screens (sm and above) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full bg-gray-900 border border-gray-700 rounded-lg shadow-md">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-300">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-300">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-300">
                        Category
                      </th>
                      <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-300">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr
                        key={exp._id || Math.random()}
                        className="border-t border-gray-800 hover:bg-gray-800"
                      >
                        <td
                          className="px-4 py-2 text-xs sm:text-sm text-gray-300 truncate max-w-[150px] sm:max-w-[200px]"
                          title={exp.description}
                        >
                          {exp.description}
                        </td>
                        <td className="px-4 py-2 text-xs sm:text-sm font-medium text-red-500">
                          ₹{(Number(exp.amount) || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-xs sm:text-sm text-gray-300">
                          {exp.category}
                        </td>
                        <td className="px-4 py-2 text-xs sm:text-sm text-gray-500">
                          {new Date(exp.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 flex space-x-2">
                          <button
                            onClick={() => handleEditExpense(exp)}
                            className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-xs sm:text-sm"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp._id)}
                            className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs sm:text-sm"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card layout for mobile screens */}
              <div className="sm:hidden space-y-4">
                {expenses.map((exp) => (
                  <div
                    key={exp._id || Math.random()}
                    className="bg-gray-900 p-4 rounded-lg shadow-md border border-gray-700"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-400">
                          Description
                        </span>
                        <span
                          className="text-xs text-gray-300 truncate max-w-[150px]"
                          title={exp.description}
                        >
                          {exp.description}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-400">
                          Amount
                        </span>
                        <span className="text-xs font-medium text-red-500">
                          ₹{(Number(exp.amount) || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-400">
                          Category
                        </span>
                        <span className="text-xs text-gray-300">
                          {exp.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-400">
                          Date
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(exp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleEditExpense(exp)}
                          className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-xs"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;