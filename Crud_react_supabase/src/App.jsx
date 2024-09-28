import React, { useState, useEffect } from "react";
import { supabase } from "./createClient";
import "./App.css";

const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addUser() {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ name, age }]);
      if (error) throw error;
      setUsers([...users, ...data]);
      setName("");
      setAge("");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  }

  async function deleteUser(id) {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  async function editUser(id) {
    const user = users.find((user) => user.id === id);
    setName(user.name);
    setAge(user.age);
    setEditId(id);
    setEditMode(true);
  }

  async function updateUser() {
    try {
      const { error } = await supabase
        .from("users")
        .update({ name, age })
        .eq("id", editId);
      if (error) throw error;
      setUsers(
        users.map((user) =>
          user.id === editId ? { ...user, name, age } : user
        )
      );
      setEditMode(false);
      setEditId(null);
      setName("");
      setAge("");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  const handleSubmit = () => {
    if (editMode) {
      updateUser();
    } else {
      addUser();
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container">
      <h1>Users Management Using Supabase X React</h1>

      <div className="form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="input"
        />
        <button onClick={handleSubmit} className="btn btn-primary">
          {editMode ? "Update" : "Add"} User
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.age}</td>
                <td>{new Date(user.created_at).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => editUser(user.id)}
                    className="btn btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="btn btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default App;
