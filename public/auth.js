const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTabs = document.querySelectorAll('.auth-tab');
const themeToggle = document.getElementById('theme-toggle');
const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3102' : window.location.origin;

// Theme toggle
themeToggle?.addEventListener('click', () => {
  const currentTheme = localStorage.getItem('bdsi-theme-mode') || localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme-mode', newTheme);
  localStorage.setItem('bdsi-theme-mode', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Load saved theme
const savedTheme = localStorage.getItem('bdsi-theme-mode') || localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme-mode', savedTheme);

// Tab switching
authTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    authTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const tabName = tab.dataset.tab;
    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.remove('active');
    });
    document.getElementById(`${tabName}-form`).classList.add('active');
  });
});

// Login
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      window.location.href = '/';
    } else {
      alert(data.error || 'Erreur de connexion');
    }
  } catch (error) {
    alert('Erreur de connexion au serveur');
  }
});

// Register
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const farmName = document.getElementById('register-farm').value;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, farmName })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      window.location.href = '/';
    } else {
      const message = data.error || (Array.isArray(data.errors) ? data.errors.map((err) => err.msg).join(', ') : 'Erreur d\'inscription');
      alert(message);
    }
  } catch (error) {
    alert('Erreur de connexion au serveur');
  }
});
