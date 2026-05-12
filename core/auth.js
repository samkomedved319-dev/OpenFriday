// Simple user authentication system
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "users.json");
const SESSION_PATH = path.join(__dirname, "session.json");

// Load users from file
function loadUsers() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    }
  } catch (e) {}
  return [];
}

// Save users to file
function saveUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

// Create user (signup)
function createUser(email, password, name) {
  const users = loadUsers();
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    return { success: false, error: "Email already exists" };
  }
  
  // Create new user
  const user = {
    id: Date.now(),
    email,
    name: name || email.split("@")[0],
    password, // In production, hash this!
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  saveUsers(users);
  
  return { success: true, user: { email: user.email, name: user.name } };
}

// Login user
function loginUser(email, password) {
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }
  
  // Create session
  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    loginAt: new Date().toISOString()
  };
  
  fs.writeFileSync(SESSION_PATH, JSON.stringify(session, null, 2));
  
  return { success: true, user: { email: user.email, name: user.name } };
}

// Logout user
function logoutUser() {
  if (fs.existsSync(SESSION_PATH)) {
    fs.unlinkSync(SESSION_PATH);
  }
  return { success: true };
}

// Check if logged in
function getCurrentUser() {
  try {
    if (fs.existsSync(SESSION_PATH)) {
      return JSON.parse(fs.readFileSync(SESSION_PATH, "utf8"));
    }
  } catch (e) {}
  return null;
}

// Check if logged in (boolean)
function isLoggedIn() {
  return getCurrentUser() !== null;
}

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  isLoggedIn
};