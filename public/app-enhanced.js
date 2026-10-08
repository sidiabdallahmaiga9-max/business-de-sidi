const form = document.getElementById('transaction-form');
const historyBody = document.getElementById('history-body');
const resourceBody = document.getElementById('resource-body');
const currentResources = document.getElementById('current-resources');
const totalSpent = document.getElementById('total-spent');
const totalProfit = document.getElementById('total-profit');
const accountBalanceDisplay = document.getElementById('account-balance');
const operationCountSummary = document.getElementById('operation-count-summary');
const operationCount = document.getElementById('operation-count');
const revenueThisMonth = document.getElementById('revenue-this-month');
const marginPercentage = document.getElementById('margin-percentage');
const resourceTypes = document.getElementById('resource-types');
const monthCount = document.getElementById('month-count');
const searchInput = document.getElementById('search-input');
const historyTypeFilter = document.getElementById('history-type-filter');
const sortField = document.getElementById('sort-field');
const sortOrder = document.getElementById('sort-order');
const dateFromInput = document.getElementById('date-from');
const dateToInput = document.getElementById('date-to');
const minAmountInput = document.getElementById('min-amount');
const maxAmountInput = document.getElementById('max-amount');
const exportCsvButton = document.getElementById('export-csv-button');
const exportExcelButton = document.getElementById('export-excel-button');
const exportPdfButton = document.getElementById('export-pdf-button');
const shareReportButton = document.getElementById('share-report-button');
const clearButton = document.getElementById('clear-button');
const dateInput = document.getElementById('date');
const monthlyChart = document.getElementById('monthly-chart');
const stockAlerts = document.getElementById('stock-alerts');
const toastRegion = document.getElementById('toast-region');
const importCsvInput = document.getElementById('import-csv-input');
const alertThresholdInput = document.getElementById('alert-threshold');
const menuButton = document.getElementById('menu-button');
const appMenu = document.getElementById('app-menu');
const menuClose = document.getElementById('menu-close');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks = Array.from(document.querySelectorAll('.menu-link'));
const menuExportCsv = document.getElementById('menu-export-csv');
const menuExportExcel = document.getElementById('menu-export-excel');
const menuExportPdf = document.getElementById('menu-export-pdf');
const menuAdminButtons = Array.from(document.querySelectorAll('[data-admin-action]'));
const menuResetData = document.getElementById('menu-reset-data');
const menuSearchInput = document.getElementById('menu-search-input');
const menuSearchEmpty = document.getElementById('menu-search-empty');
const menuLoginForm = document.getElementById('menu-login-form');
const DEFAULT_ADMIN_SECRET = '123456';
const ADMIN_SECRET_KEY = 'business-sidi-admin-secret';
const helpModal = document.getElementById('help-modal');
const helpContent = document.getElementById('help-content');
const helpModalClose = document.querySelector('.help-modal-close');
const menuRegisterForm = document.getElementById('menu-register-form');
const menuAuthTabs = Array.from(document.querySelectorAll('.auth-toggle'));
const menuProfileName = document.getElementById('profile-name');
const menuProfileEmail = document.getElementById('profile-email');
const menuProfileAvatar = document.getElementById('profile-avatar');
const menuProfileLoggedInActions = document.getElementById('profile-logged-in-actions');
const menuProfileAuthBox = document.getElementById('profile-auth-box');
const menuLogoutButton = document.getElementById('menu-logout-button');
const assistantForm = document.getElementById('assistant-form');
const assistantInput = document.getElementById('assistant-input');
const assistantResponse = document.getElementById('assistant-response');
const assistantChips = Array.from(document.querySelectorAll('.assistant-chip'));
const menuAlertDetail = document.getElementById('menu-alert-detail');
const chatThemeToggle = document.getElementById('theme-toggle');
const headerThemeToggle = document.getElementById('theme-toggle-header');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeOptions = Array.from(document.querySelectorAll('.theme-option'));
const themeColors = Array.from(document.querySelectorAll('.theme-color'));
const gradient1ColorInput = document.getElementById('gradient1Color');
const gradient2ColorInput = document.getElementById('gradient2Color');
const colorPreviewBar = document.getElementById('colorPreviewBar');
const darkModeToggle = document.getElementById('darkModeToggle');
const applyThemeBtn = document.getElementById('applyThemeBtn');
const setStockMode = document.getElementById('setStockMode');
const unitPriceInput = document.getElementById('unitPrice');
const typeSelect = document.getElementById('type');
const customTypeInput = document.getElementById('custom-type');
const directionSelect = document.getElementById('direction');
const resetDataButton = document.getElementById('reset-data-button');
const fabButton = document.getElementById('fab-add');
const installAppButton = document.getElementById('install-app-btn');
const installAppMenuButton = document.getElementById('install-app-menu-btn');
const mobileQrImage = document.getElementById('mobile-qr-image');
const mobileQrLink = document.getElementById('mobile-qr-link');
const mobileQrStatus = document.getElementById('mobile-qr-status');
const copyMobileLinkButton = document.getElementById('copy-mobile-link');
let deferredPrompt = null;
let allTransactions = [];
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let isAdminMode = false;
let pieChart = null;
let lineChart = null;

// Auth functions
function getAuthHeaders() {
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  if (isAdminMode) {
    headers['X-Admin-Mode'] = 'true';
  }
  return headers;
}

async function login(email, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showToast('Connexion réussie', 'success');
      return true;
    } else {
      const message = data.error || (Array.isArray(data.errors) ? data.errors.map((err) => err.msg).join(', ') : 'Erreur de connexion');
      showToast(message, 'error');
      return false;
    }
  } catch (error) {
    showToast('Erreur de connexion au serveur', 'error');
    return false;
  }
}

async function register(email, password, name, farmName) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, farmName })
    });
    const data = await response.json();
    if (response.ok) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showToast('Inscription réussie', 'success');
      return true;
    } else {
      const message = data.error || (Array.isArray(data.errors) ? data.errors.map((err) => err.msg).join(', ') : 'Erreur d\'inscription');
      showToast(message, 'error');
      return false;
    }
  } catch (error) {
    showToast('Erreur de connexion au serveur', 'error');
    return false;
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  showToast('Déconnexion réussie', 'info');
  updateProfileSummary();
  window.location.reload();
}

function applySavedProfilePhoto(fallbackLetter = 'U') {
  const savedPhoto = localStorage.getItem('bdsi-profile-photo');
  renderProfilePhoto(savedPhoto, fallbackLetter);
}

function updateProfileSummary() {
  if (!menuProfileName || !menuProfileEmail || !menuProfileAvatar) return;

  const isLoggedIn = !!currentUser && !!authToken;

  if (isLoggedIn) {
    const name = currentUser.name || 'Utilisateur';
    const email = currentUser.email || 'Sans email';
    const initials = name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U';

    menuProfileName.textContent = name;
    menuProfileEmail.textContent = email;
    menuProfileLoggedInActions?.classList.remove('hidden-profile-actions');
    menuProfileAuthBox?.style.setProperty('display', 'none');
    applySavedProfilePhoto(initials);
  } else {
    menuProfileName.textContent = 'Invité';
    menuProfileEmail.textContent = 'Connectez-vous pour accéder à votre profil';
    menuProfileLoggedInActions?.classList.add('hidden-profile-actions');
    menuProfileAuthBox?.style.setProperty('display', 'block');
    applySavedProfilePhoto('U');
  }
}

function setAuthTab(tabName) {
  menuAuthTabs.forEach((tab) => {
    const active = tab.dataset.authTab === tabName;
    tab.classList.toggle('active', active);
  });

  if (menuLoginForm && menuRegisterForm) {
    const showLogin = tabName === 'login';
    menuLoginForm.style.display = showLogin ? 'block' : 'none';
    menuRegisterForm.style.display = showLogin ? 'none' : 'block';
    menuLoginForm.classList.toggle('active', showLogin);
    menuRegisterForm.classList.toggle('active', !showLogin);
  }
}

menuAuthTabs.forEach((tab) => {
  tab.addEventListener('click', () => setAuthTab(tab.dataset.authTab));
});

menuLoginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('menu-login-email')?.value.trim();
  const password = document.getElementById('menu-login-password')?.value;

  if (!email || !password) {
    showToast('Saisis ton email et ton mot de passe.', 'error');
    return;
  }

  const ok = await login(email, password);
  if (ok) {
    updateProfileSummary();
    closeMenu();
  }
});

menuRegisterForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('menu-register-name')?.value.trim();
  const email = document.getElementById('menu-register-email')?.value.trim();
  const farmName = document.getElementById('menu-register-farm')?.value.trim();
  const password = document.getElementById('menu-register-password')?.value;

  if (!name || !email || !farmName || !password) {
    showToast('Complète tous les champs du profil.', 'error');
    return;
  }

  const ok = await register(email, password, name, farmName);
  if (ok) {
    updateProfileSummary();
    closeMenu();
  }
});

menuLogoutButton?.addEventListener('click', () => {
  logout();
});

function parseNumericValue(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const normalized = String(value).trim().replace(/\s/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
  const amount = parseNumericValue(value);
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`;
}

function showToast(message, tone = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${tone}`;
  toast.textContent = message;
  toastRegion.appendChild(toast);
  window.setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  window.setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3200);
}

async function refreshMobileQrCode() {
  if (!mobileQrImage || !mobileQrLink) return;

  try {
    const response = await fetch('/api/mobile-link');
    if (!response.ok) throw new Error('mobile link unavailable');
    const data = await response.json();
    const targetUrl = data?.url || `${window.location.origin}/#assistant`;
    const encodedUrl = encodeURIComponent(targetUrl);
    mobileQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodedUrl}`;
    mobileQrImage.alt = `QR code pour ouvrir ${targetUrl}`;
    mobileQrLink.href = targetUrl;
    mobileQrLink.title = targetUrl;
    if (mobileQrStatus) mobileQrStatus.textContent = 'QR prêt · accès local ou distant selon la configuration du serveur.';
  } catch (error) {
    const fallbackUrl = `${window.location.origin}/#assistant`;
    mobileQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(fallbackUrl)}`;
    mobileQrImage.alt = `QR code pour ouvrir ${fallbackUrl}`;
    mobileQrLink.href = fallbackUrl;
    mobileQrLink.title = fallbackUrl;
    if (mobileQrStatus) mobileQrStatus.textContent = 'Adresse locale détectée. Pour un accès hors Wi‑Fi, configurez PUBLIC_APP_URL sur un domaine public.';
  }
}

copyMobileLinkButton?.addEventListener('click', async () => {
  const targetUrl = mobileQrLink?.href;
  if (!targetUrl || targetUrl.endsWith('#')) {
    if (mobileQrStatus) mobileQrStatus.textContent = 'Le lien mobile n’est pas encore prêt.';
    return;
  }

  try {
    await navigator.clipboard.writeText(targetUrl);
    if (mobileQrStatus) mobileQrStatus.textContent = 'Lien du bot copié. Vous pouvez le partager avec votre appareil.';
  } catch (error) {
    const copyField = document.createElement('textarea');
    copyField.value = targetUrl;
    copyField.setAttribute('readonly', '');
    copyField.style.position = 'fixed';
    copyField.style.opacity = '0';
    document.body.appendChild(copyField);
    copyField.select();
    const copied = document.execCommand('copy');
    copyField.remove();
    if (mobileQrStatus) {
      mobileQrStatus.textContent = copied
        ? 'Lien du bot copié. Vous pouvez le partager avec votre appareil.'
        : `Copiez ce lien depuis le QR : ${targetUrl}`;
    }
  }
});

mobileQrImage?.addEventListener('error', () => {
  if (mobileQrStatus) mobileQrStatus.textContent = 'QR indisponible. Utilisez le lien ou réessayez avec une connexion Internet.';
});

async function fetchHistory() {
  if (!authToken) {
    return [];
  }

  try {
    const response = await fetch('/api/history', {
      headers: getAuthHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    if (response.status === 401) {
      showToast('Session expirée ou non connectée.', 'info');
    }
    return [];
  } catch (error) {
    console.error('Erreur lors du chargement de l’historique:', error);
    return [];
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString('fr-FR');
}

function formatType(type) {
  if (type === 'achat') return 'Achat';
  if (type === 'vente') return 'Vente';
  if (type === 'stock') return 'Stock';
  return type;
}

function typeClass(type) {
  if (type === 'achat') return 'type-achat';
  if (type === 'vente') return 'type-vente';
  if (type === 'stock') return 'type-stock';
  return '';
}

function setDefaultDate() {
  if (!dateInput) return;
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  dateInput.value = local;
}

function buildResourceSummary(transactions) {
  const summary = {};
  transactions
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((item) => {
      if (item.type === 'stock') {
        summary[item.resource] = parseNumericValue(item.quantity);
      } else if (item.type === 'achat') {
        summary[item.resource] = (summary[item.resource] || 0) + parseNumericValue(item.quantity);
      } else if (item.type === 'vente') {
        summary[item.resource] = (summary[item.resource] || 0) - parseNumericValue(item.quantity);
      } else if (item.type === 'perte') {
        summary[item.resource] = (summary[item.resource] || 0) - parseNumericValue(item.quantity);
      }
    });
  return summary;
}

function getMonthsList(count = 6) {
  const now = new Date();
  const months = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const label = date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    months.push({ key, label, achat: 0, vente: 0 });
  }
  return months;
}

function updateSummary(transactions) {
  const resourceSummary = buildResourceSummary(transactions);
  const resources = Object.values(resourceSummary).reduce((acc, value) => acc + parseNumericValue(value), 0);
  const spent = transactions.reduce((acc, item) => acc + (item.type === 'achat' ? parseNumericValue(item.total) : 0), 0);
  const earned = transactions.reduce((acc, item) => acc + (item.type === 'vente' ? parseNumericValue(item.total) : 0), 0);
  const losses = transactions.reduce((acc, item) => acc + (item.type === 'perte' ? parseNumericValue(item.total) : 0), 0);
  const balance = transactions.reduce((acc, item) => acc + getTransactionBalanceImpact(item), 0);
  const profit = earned - spent - losses;
  const uniqueResources = Object.keys(resourceSummary).length;

  // Revenue this month
  const monthTransactions = getCurrentMonthTransactions(transactions);
  const monthRevenue = monthTransactions.reduce((acc, item) => acc + (item.type === 'vente' ? parseNumericValue(item.total) : 0), 0);

  // Margin percentage
  const margin = earned > 0 ? ((earned - spent - losses) / earned * 100).toFixed(1) : '0.0';

  currentResources.textContent = parseNumericValue(resources).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  totalSpent.textContent = formatCurrency(spent + losses);
  totalProfit.textContent = formatCurrency(profit);
  totalProfit.className = profit >= 0 ? 'positive' : 'negative';
  accountBalanceDisplay.textContent = formatCurrency(balance);
  accountBalanceDisplay.className = balance >= 0 ? 'positive' : 'negative';
  operationCountSummary.textContent = transactions.length;
  operationCount.textContent = transactions.length;
  resourceTypes.textContent = uniqueResources;
  monthCount.textContent = getMonthsList().length;
  revenueThisMonth.textContent = formatCurrency(monthRevenue);
  marginPercentage.textContent = `${margin}%`;
  marginPercentage.className = margin >= 0 ? 'positive' : 'negative';
}

function renderHistory(transactions) {
  historyBody.innerHTML = '';
  if (transactions.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="9">Aucune opération trouvée.</td>';
    historyBody.appendChild(emptyRow);
    return;
  }

  let runningBalance = 0;
  transactions.forEach((transaction) => {
    const row = document.createElement('tr');
    const lossCauseDisplay = transaction.type === 'perte' ? (transaction.lossCause || '-') : '-';
    const impact = getTransactionBalanceImpact(transaction);
    runningBalance += impact;
    row.innerHTML = `
      <td>${formatDate(transaction.date)}</td>
      <td><span class="type-pill ${typeClass(transaction.type)}">${formatType(transaction.type)}</span></td>
      <td>${transaction.resource}</td>
      <td>${parseNumericValue(transaction.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td>${transaction.type === 'stock' ? '-' : formatCurrency(parseNumericValue(transaction.unitPrice))}</td>
      <td>${transaction.type === 'stock' ? '-' : formatCurrency(parseNumericValue(transaction.total))}</td>
      <td class="${runningBalance >= 0 ? 'positive' : 'negative'}">${formatCurrency(runningBalance)}</td>
      <td>${lossCauseDisplay}</td>
      <td>${transaction.note || '-'}</td>
    `;
    historyBody.appendChild(row);
  });
}

function renderResourceBreakdown(transactions) {
  const summary = buildResourceSummary(transactions);
  const entries = Object.entries(summary).sort((a, b) => b[1] - a[1]);
  resourceBody.innerHTML = '';

  if (entries.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="2">Aucune ressource enregistrée.</td>';
    resourceBody.appendChild(row);
    return;
  }

  entries.forEach(([resource, stock]) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${resource}</td>
      <td class="${parseNumericValue(stock) >= 0 ? 'positive' : 'negative'}">${parseNumericValue(stock).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    `;
    resourceBody.appendChild(row);
  });
}

function renderMonthlyChart(transactions) {
  const months = getMonthsList(6);
  transactions.forEach((transaction) => {
    if (transaction.type !== 'achat' && transaction.type !== 'vente') return;
    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const month = months.find((entry) => entry.key === key);
    if (month) {
      month[transaction.type] += parseNumericValue(transaction.total);
    }
  });

  const maxValue = Math.max(...months.map((month) => Math.max(month.achat, month.vente, 1)));
  monthlyChart.innerHTML = '';

  months.forEach((month) => {
    const item = document.createElement('div');
    item.className = 'bar-item';
    const label = document.createElement('div');
    label.className = 'bar-label';
    label.innerHTML = `<span>${month.label}</span><span>${formatCurrency(month.achat + month.vente)}</span>`;
    const track = document.createElement('div');
    track.className = 'bar-track';
    const fillAchat = document.createElement('div');
    fillAchat.className = 'bar-fill achat';
    fillAchat.style.width = `${(month.achat / maxValue) * 100}%`;
    const fillVente = document.createElement('div');
    fillVente.className = 'bar-fill vente';
    fillVente.style.width = `${(month.vente / maxValue) * 100}%`;
    track.appendChild(fillAchat);
    track.appendChild(fillVente);
    item.appendChild(label);
    item.appendChild(track);
    monthlyChart.appendChild(item);
  });
}

// Chat Fullscreen Modal
const chatFullscreenModal = document.getElementById('chat-fullscreen-modal');
const chatFullscreenClose = document.querySelector('.chat-fullscreen-close');
const chatHistoryBtn = document.getElementById('chat-history-btn');
const chatExportBtn = document.getElementById('chat-export-btn');
const chatSidebar = document.getElementById('chat-sidebar');
const chatSidebarClose = document.getElementById('chat-sidebar-close');
const chatMessagesFullscreen = document.getElementById('chat-messages-fullscreen');
const assistantFormFullscreen = document.getElementById('assistant-form-fullscreen');
const assistantInputFullscreen = document.getElementById('assistant-input-fullscreen');
const voiceInputBtnFullscreen = document.getElementById('voice-input-btn-fullscreen');
const quickActionsBtnFullscreen = document.getElementById('quick-actions-btn-fullscreen');
const quickActionsDropdownFullscreen = document.getElementById('quick-actions-dropdown-fullscreen');
const inputSuggestions = document.getElementById('input-suggestions');
const chatSuggestionsTitle = document.getElementById('chat-suggestions-title');
const charCounter = document.getElementById('char-counter');
const chatHistorySearch = document.getElementById('chat-history-search');
const searchClearBtn = document.getElementById('search-clear-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');

function openChatFullscreen() {
  if (chatFullscreenModal) {
    document.documentElement.classList.add('assistant-open');
    document.body.classList.add('assistant-open');
    chatFullscreenModal.setAttribute('aria-hidden', 'false');
    chatFullscreenModal.classList.add('open');
    
    // Clone messages to fullscreen
    if (chatMessagesFullscreen && chatMessages) {
      chatMessagesFullscreen.innerHTML = chatMessages.innerHTML;
    }
    
    // Focus on input
    if (assistantInputFullscreen) {
      assistantInputFullscreen.focus();
    }
    
    // Show suggestions
    if (inputSuggestions) {
      inputSuggestions.style.display = assistantInputFullscreen?.value ? 'none' : 'flex';
    }
    if (chatSuggestionsTitle) {
      chatSuggestionsTitle.style.display = assistantInputFullscreen?.value ? 'none' : 'block';
    }
  }
}

function closeChatFullscreen() {
  if (chatFullscreenModal) {
    document.documentElement.classList.remove('assistant-open');
    document.body.classList.remove('assistant-open');
    chatFullscreenModal.setAttribute('aria-hidden', 'true');
    chatFullscreenModal.classList.remove('open');
    
    // Hide sidebar
    if (chatSidebar) {
      chatSidebar.style.display = 'none';
    }
    
    // Hide dropdown
    if (quickActionsDropdownFullscreen) {
      quickActionsDropdownFullscreen.style.display = 'none';
    }
    if (window.location.hash === '#assistant') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }
}

chatFullscreenClose?.addEventListener('click', closeChatFullscreen);
chatFullscreenModal?.addEventListener('click', (e) => {
  if (e.target === chatFullscreenModal) closeChatFullscreen();
});

chatSidebarClose?.addEventListener('click', () => {
  if (chatSidebar) {
    chatSidebar.style.display = 'none';
  }
});

// Search functionality
chatHistorySearch?.addEventListener('input', (e) => {
  const value = e.target.value;
  if (searchClearBtn) {
    searchClearBtn.style.display = value.length > 0 ? 'flex' : 'none';
  }
  // Filter history items (to be implemented)
});

searchClearBtn?.addEventListener('click', () => {
  if (chatHistorySearch) {
    chatHistorySearch.value = '';
    if (searchClearBtn) {
      searchClearBtn.style.display = 'none';
    }
  }
});

function clearConversationHistory() {
  conversationHistory = [];
  localStorage.removeItem('bdsi-conversation-history');

  if (chatMessages) chatMessages.innerHTML = '';
  if (chatMessagesFullscreen) chatMessagesFullscreen.innerHTML = '';

  const historyList = document.getElementById('chat-history-list');
  if (historyList) {
    historyList.innerHTML = '<div class="chat-history-empty">Aucun historique pour le moment.</div>';
  }

  if (chatHistorySearch) {
    chatHistorySearch.value = '';
  }

  showToast('Historique effacé', 'success');
}

// Clear history
clearHistoryBtn?.addEventListener('click', () => {
  if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
    clearConversationHistory();
  }
});

// Character counter
assistantInputFullscreen?.addEventListener('input', (e) => {
  const length = e.target.value.length;
  const maxLength = 500;
  
  if (charCounter) {
    charCounter.textContent = `${length}/${maxLength}`;
    
    // Update counter color based on length
    charCounter.classList.remove('warning', 'error');
    if (length > maxLength * 0.8) {
      charCounter.classList.add('warning');
    }
    if (length >= maxLength) {
      charCounter.classList.add('error');
    }
  }
  
  // Show/hide suggestions based on input
  if (inputSuggestions) {
    inputSuggestions.style.display = length > 0 ? 'none' : 'flex';
  }
  if (chatSuggestionsTitle) {
    chatSuggestionsTitle.style.display = length > 0 ? 'none' : 'block';
  }
});

// Input suggestions
document.querySelectorAll('.suggestion-item').forEach(item => {
  item.addEventListener('click', () => {
    const suggestion = item.getAttribute('data-suggestion');
    if (assistantInputFullscreen && suggestion) {
      assistantInputFullscreen.value = suggestion;
      if (inputSuggestions) {
        inputSuggestions.style.display = 'none';
      }
      if (chatSuggestionsTitle) chatSuggestionsTitle.style.display = 'none';
      assistantFormFullscreen?.requestSubmit();
    }
  });
});

// Quick actions dropdown fullscreen
quickActionsBtnFullscreen?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (quickActionsDropdownFullscreen) {
    quickActionsDropdownFullscreen.style.display = 
      quickActionsDropdownFullscreen.style.display === 'none' ? 'block' : 'none';
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (quickActionsDropdownFullscreen && 
      !quickActionsDropdownFullscreen.contains(e.target) && 
      e.target !== quickActionsBtnFullscreen) {
    quickActionsDropdownFullscreen.style.display = 'none';
  }
});

// Quick action items fullscreen
document.querySelectorAll('#quick-actions-dropdown-fullscreen .quick-action-item').forEach(item => {
  item.addEventListener('click', () => {
    const action = item.getAttribute('data-action');
    
    switch(action) {
      case 'export-pdf':
        downloadPDF(allTransactions);
        showToast('PDF exporté', 'success');
        break;
      case 'export-excel':
        downloadExcel(allTransactions);
        showToast('Excel exporté', 'success');
        break;
      case 'show-chart':
        closeChatFullscreen();
        // Scroll to charts section
        break;
      case 'email':
        shareReport(allTransactions);
        break;
      case 'close-fullscreen':
        closeChatFullscreen();
        break;
    }
    
    if (quickActionsDropdownFullscreen) {
      quickActionsDropdownFullscreen.style.display = 'none';
    }
  });
});

// Fullscreen form submission
assistantFormFullscreen?.addEventListener('submit', (e) => {
  e.preventDefault();
  const question = assistantInputFullscreen?.value.trim();
  if (!question) return;
  
  // Add to fullscreen chat
  addChatMessage(question, true, chatMessagesFullscreen);
  
  // Also add to regular chat if it exists
  if (chatMessages) {
    addChatMessage(question, true, chatMessages);
  }
  
  assistantInputFullscreen.value = '';
  
  showTypingIndicator();
  
  setTimeout(() => {
    hideTypingIndicator();
    const response = getAssistantAnswerWithContext(question, allTransactions);
    addChatMessage(response, false, chatMessagesFullscreen);
    addAssistantFollowups(question, chatMessagesFullscreen);
    
    // Also add to regular chat if it exists
    if (chatMessages) {
      addChatMessage(response, false, chatMessages);
      addAssistantFollowups(question, chatMessages);
    }
  }, 1000);
});

// Chat history sidebar
chatHistoryBtn?.addEventListener('click', () => {
  if (chatSidebar) {
    chatSidebar.style.display = chatSidebar.style.display === 'none' ? 'flex' : 'none';
    if (chatSidebar.style.display === 'flex') {
      loadChatHistory();
    }
  }
});

function loadChatHistory() {
  const historyList = document.getElementById('chat-history-list');
  if (!historyList) return;

  historyList.innerHTML = '';

  if (!conversationHistory.length) {
    historyList.innerHTML = '<div class="chat-history-empty">Aucun historique pour le moment.</div>';
    return;
  }

  conversationHistory.forEach((item, index) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'chat-history-item';
    const question = document.createElement('div');
    question.className = 'chat-history-item-question';
    question.textContent = item.question;
    const timestamp = document.createElement('div');
    timestamp.className = 'chat-history-item-time';
    timestamp.textContent = new Date(item.timestamp).toLocaleString('fr-FR');
    historyItem.append(question, timestamp);
    historyItem.addEventListener('click', () => {
      if (assistantInputFullscreen) assistantInputFullscreen.value = item.question;
      assistantInputFullscreen?.focus();
    });
    historyList.appendChild(historyItem);
  });
}

// Chat history search
document.getElementById('chat-history-search')?.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const historyList = document.getElementById('chat-history-list');
  if (!historyList) return;
  
  const items = historyList.querySelectorAll('.chat-history-item');
  items.forEach(item => {
    const question = item.querySelector('.chat-history-item-question').textContent.toLowerCase();
    item.style.display = question.includes(searchTerm) ? 'block' : 'none';
  });
});

// Export chat history
chatExportBtn?.addEventListener('click', () => {
  const historyText = conversationHistory.map(item => 
    `Q: ${item.question}\nA: ${item.answer}\nDate: ${new Date(item.timestamp).toLocaleString('fr-FR')}\n---`
  ).join('\n\n');
  
  const blob = new Blob([historyText], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast('Historique exporté', 'success');
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K to open assistant
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (assistantInput) assistantInput.focus();
    openMenu();
  }
  
  // Ctrl/Cmd + F to open fullscreen
  if ((e.ctrlKey || e.metaKey) && e.key === 'f' && e.shiftKey) {
    e.preventDefault();
    openChatFullscreen();
  }
  
  // Escape to close modals
  if (e.key === 'Escape') {
    closeChatFullscreen();
    if (chatSidebar) chatSidebar.style.display = 'none';
  }
  
  // Ctrl/Cmd + H to toggle high contrast
  if ((e.ctrlKey || e.metaKey) && e.key === 'h' && e.shiftKey) {
    e.preventDefault();
    document.body.classList.toggle('high-contrast');
    showToast(document.body.classList.contains('high-contrast') ? 'Mode contraste élevé activé' : 'Mode contraste élevé désactivé', 'info');
  }
});

// Add keyboard shortcuts hint
const shortcutsHint = document.createElement('div');
shortcutsHint.className = 'keyboard-shortcuts-hint';
shortcutsHint.innerHTML = `
  <kbd>Ctrl</kbd>+<kbd>K</kbd> Assistant | 
  <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> Plein écran | 
  <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>H</kbd> Contraste
`;
document.body.appendChild(shortcutsHint);

// Hide shortcuts hint after 10 seconds
setTimeout(() => {
  shortcutsHint.style.opacity = '0';
  shortcutsHint.style.transition = 'opacity 0.5s ease';
  setTimeout(() => shortcutsHint.remove(), 500);
}, 10000);

// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const accordionId = header.getAttribute('data-accordion');
    const content = document.getElementById(`accordion-${accordionId}`);
    
    // Toggle active class on header
    header.classList.toggle('active');
    
    // Toggle active class on content
    if (content) {
      content.classList.toggle('active');
    }
    
    // Close other accordions (optional - remove if you want multiple open)
    document.querySelectorAll('.accordion-header').forEach(otherHeader => {
      if (otherHeader !== header) {
        otherHeader.classList.remove('active');
        const otherId = otherHeader.getAttribute('data-accordion');
        const otherContent = document.getElementById(`accordion-${otherId}`);
        if (otherContent) {
          otherContent.classList.remove('active');
        }
      }
    });
  });
});

// Assistant button to open chat fullscreen
document.getElementById('menu-assistant-btn')?.addEventListener('click', () => {
  closeMenu();
  openChatFullscreen();
});

function filterMenuSections(searchTerm = '') {
  const query = searchTerm.trim().toLocaleLowerCase('fr');
  const sections = Array.from(appMenu?.querySelectorAll('.menu-panel > .menu-section') || []);
  let visibleSections = 0;

  sections.forEach((section) => {
    const title = section.querySelector('.section-header h4, .accordion-header');
    const titleMatches = !query || (title?.textContent || '').toLocaleLowerCase('fr').includes(query);
    const searchableItems = Array.from(section.querySelectorAll('.menu-button, .menu-link, .stat-card, .menu-question-shortcut'));
    const itemMatches = searchableItems.filter((item) => !query || item.textContent.toLocaleLowerCase('fr').includes(query));

    searchableItems.forEach((item) => {
      item.hidden = !!query && !titleMatches && !itemMatches.includes(item);
    });
    const sectionMatches = !query || titleMatches || itemMatches.length > 0 || section.textContent.toLocaleLowerCase('fr').includes(query);
    section.hidden = !sectionMatches;
    if (sectionMatches) visibleSections += 1;
  });

  if (menuSearchEmpty) menuSearchEmpty.hidden = !query || visibleSections > 0;
}

menuSearchInput?.addEventListener('input', () => filterMenuSections(menuSearchInput.value));

document.querySelectorAll('[data-assistant-question]').forEach((button) => {
  button.addEventListener('click', () => {
    const question = button.getAttribute('data-assistant-question');
    closeMenu();
    openChatFullscreen();
    if (assistantInputFullscreen && question) {
      assistantInputFullscreen.value = question;
      assistantFormFullscreen?.requestSubmit();
    }
  });
});

document.getElementById('alert-banner')?.addEventListener('click', () => {
  closeMenu();
  openChatFullscreen();
  if (assistantInputFullscreen) {
    assistantInputFullscreen.value = '/alerts';
    assistantFormFullscreen?.requestSubmit();
  }
});

// Chat Interface Moderne
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const quickActionsDropdown = document.getElementById('quick-actions-dropdown');
const quickActionsBtn = document.getElementById('quick-actions-btn');
const voiceInputBtn = document.getElementById('voice-input-btn');

function showTypingIndicator() {
  // Show typing indicator in fullscreen chat if available
  if (chatMessagesFullscreen) {
    const indicator = document.createElement('div');
    indicator.className = 'chat-message bot-message typing-message';
    indicator.id = 'typing-indicator-fullscreen';
    indicator.innerHTML = `
      <div class="message-avatar bot-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    chatMessagesFullscreen.appendChild(indicator);
    chatMessagesFullscreen.scrollTop = chatMessagesFullscreen.scrollHeight;
  }
  
  // Show typing indicator in regular chat if available
  if (chatMessages && typingIndicator) {
    typingIndicator.style.display = 'flex';
  }
}

function hideTypingIndicator() {
  // Hide typing indicator in fullscreen chat
  const fullscreenIndicator = document.getElementById('typing-indicator-fullscreen');
  if (fullscreenIndicator && chatMessagesFullscreen) {
    chatMessagesFullscreen.removeChild(fullscreenIndicator);
  }
  
  // Hide typing indicator in regular chat
  if (typingIndicator) {
    typingIndicator.style.display = 'none';
  }
}

function addChatMessage(text, isUser = false, targetContainer = null) {
  // Use provided container or default to chatMessages
  const target = targetContainer || chatMessages;
  
  // Check if target exists
  if (!target) {
    console.error('chatMessages element not found');
    return;
  }

  if (isUser) target.querySelector('.chat-welcome')?.remove();
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
  
  const avatar = document.createElement('div');
  avatar.className = `message-avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`;
  avatar.textContent = isUser ? '👤' : '🤖';
  
  const content = document.createElement('div');
  content.className = 'message-content';
  
  const messageText = document.createElement('div');
  messageText.className = 'message-text';
  
  // Parse and format the response with cards
  const formattedText = formatResponseWithCards(text);
  messageText.innerHTML = formattedText;
  
  const messageTime = document.createElement('div');
  messageTime.className = 'message-time';
  messageTime.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  content.appendChild(messageText);
  content.appendChild(messageTime);
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  
  target.appendChild(messageDiv);
  target.scrollTop = target.scrollHeight;
}

function formatResponseWithCards(text) {
  // Detect statistics and convert to cards
  if (text.includes('📊') || text.includes('💰') || text.includes('📈')) {
    const lines = text.split('\n');
    let formatted = '';
    let inCard = false;
    let cardContent = [];
    
    for (const line of lines) {
      if (line.startsWith('•') || line.startsWith('-')) {
        if (!inCard) {
          inCard = true;
          cardContent = [];
        }
        cardContent.push(line);
      } else {
        if (inCard) {
          formatted += createStatCard(cardContent);
          inCard = false;
          cardContent = [];
        }
        formatted += line + '<br>';
      }
    }
    
    if (inCard && cardContent.length > 0) {
      formatted += createStatCard(cardContent);
    }
    
    return formatted;
  }
  
  return text;
}

function createStatCard(items) {
  const card = document.createElement('div');
  card.className = 'stat-card';
  
  let html = '<div class="stat-card-grid">';
  
  for (const item of items) {
    const match = item.match(/[•-]\s*(.+?):\s*(.+)/);
    if (match) {
      const label = match[1];
      const value = match[2];
      const icon = getIconForLabel(label);
      const color = getColorForValue(value);
      
      html += `
        <div class="stat-card-item">
          <span class="stat-item-icon">${icon}</span>
          <div class="stat-item-content">
            <span class="stat-item-label">${label}</span>
            <span class="stat-item-value" style="color: ${color}">${value}</span>
          </div>
        </div>
      `;
    }
  }
  
  html += '</div>';
  return html;
}

function getIconForLabel(label) {
  const lower = label.toLowerCase();
  if (lower.includes('chiffre') || lower.includes('ca') || lower.includes('revenu')) return '💰';
  if (lower.includes('bénéfice') || lower.includes('profit')) return '📈';
  if (lower.includes('dépense') || lower.includes('coût')) return '📉';
  if (lower.includes('vente') || lower.includes('opération')) return '🛒';
  if (lower.includes('stock') || lower.includes('ressource')) return '📦';
  if (lower.includes('alerte')) return '⚠️';
  if (lower.includes('marge')) return '📊';
  return '📋';
}

function getColorForValue(value) {
  const lower = value.toLowerCase();
  if (lower.includes('-') || lower.includes('perte') || lower.includes('rouge')) return '#ef4444';
  if (lower.includes('+') || lower.includes('hausse') || lower.includes('vert')) return '#00b894';
  if (lower.includes('fcfa') || lower.includes('€') || lower.includes('$')) return '#6c5ce7';
  return 'var(--text)';
}

function renderPieChart(transactions) {
  const resourceSummary = buildResourceSummary(transactions);
  const data = Object.entries(resourceSummary).map(([resource, value]) => ({
    label: resource,
    value: Math.abs(value)
  }));

  const canvas = document.createElement('canvas');
  canvas.id = 'pie-chart-canvas';
  
  // Remove existing chart
  const existingCanvas = document.getElementById('pie-chart-canvas');
  if (existingCanvas) existingCanvas.remove();
  
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';
  chartContainer.appendChild(canvas);
  
  // Add to stats grid
  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid) {
    const pieSection = document.createElement('div');
    pieSection.className = 'stats-panel';
    pieSection.innerHTML = '<h3>Répartition du stock</h3>';
    pieSection.appendChild(chartContainer);
    statsGrid.appendChild(pieSection);
  }

  if (pieChart) pieChart.destroy();
  
  pieChart = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        data: data.map(d => d.value),
        backgroundColor: [
          '#6c5ce7', '#f72585', '#00b894', '#fdcb6e', '#4facfe', '#e17055'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function renderLineChart(transactions) {
  const months = getMonthsList(12);
  const profitData = [];
  
  months.forEach((month) => {
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      return key === month.key && (t.type === 'achat' || t.type === 'vente');
    });
    
    const spent = monthTransactions.reduce((acc, t) => acc + (t.type === 'achat' ? parseNumericValue(t.total) : 0), 0);
    const earned = monthTransactions.reduce((acc, t) => acc + (t.type === 'vente' ? parseNumericValue(t.total) : 0), 0);
    profitData.push(earned - spent);
  });

  const canvas = document.createElement('canvas');
  canvas.id = 'line-chart-canvas';
  
  const existingCanvas = document.getElementById('line-chart-canvas');
  if (existingCanvas) existingCanvas.remove();
  
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';
  chartContainer.appendChild(canvas);
  
  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid) {
    const lineSection = document.createElement('div');
    lineSection.className = 'stats-panel';
    lineSection.innerHTML = '<h3>Évolution des bénéfices</h3>';
    lineSection.appendChild(chartContainer);
    statsGrid.appendChild(lineSection);
  }

  if (lineChart) lineChart.destroy();
  
  lineChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [{
        label: 'Bénéfice',
        data: profitData,
        borderColor: '#00b894',
        backgroundColor: 'rgba(0, 184, 148, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function getLowStockAlerts(transactions, customThreshold = Number(alertThresholdInput?.value || 5)) {
  const threshold = Number(customThreshold || 5);
  const summary = buildResourceSummary(transactions);

  return Object.entries(summary)
    .filter(([, quantity]) => Number(quantity) <= threshold)
    .map(([resource, quantity]) => ({ resource, quantity: Number(quantity) }))
    .sort((a, b) => a.quantity - b.quantity);
}

let lastStockAlertSignature = '';

function triggerLowStockBotAlerts(transactions) {
  const threshold = Number(alertThresholdInput?.value || 5);
  const lowAlerts = getLowStockAlerts(transactions, threshold);

  if (lowAlerts.length === 0) {
    lastStockAlertSignature = '';
    return;
  }

  const signature = lowAlerts.map(({ resource, quantity }) => `${resource}:${quantity}`).join('|');
  if (signature === lastStockAlertSignature) {
    return;
  }

  lastStockAlertSignature = signature;
  const summaryText = lowAlerts
    .slice(0, 3)
    .map(({ resource, quantity }) => `${resource} (${quantity.toFixed(2)} restants)`)
    .join(' • ');

  const alertMessage = `⚠️ Alerte stock : ${summaryText}`;
  if (chatMessagesFullscreen) addChatMessage(alertMessage, false, chatMessagesFullscreen);
  if (chatMessages) addChatMessage(alertMessage, false, chatMessages);
  showToast(`Alerte stock : ${summaryText}`, 'warning');
}

function renderStockAlerts(transactions) {
  const threshold = Number(alertThresholdInput?.value || 5);
  const items = getLowStockAlerts(transactions, threshold);

  if (!stockAlerts) return;
  if (items.length === 0) {
    stockAlerts.classList.add('hidden');
    stockAlerts.innerHTML = '';
    return;
  }

  stockAlerts.classList.remove('hidden');
  stockAlerts.innerHTML = `
    <div class="alert-panel__header">
      <h3>Alertes de stock</h3>
      <span>Seuil : ${threshold}</span>
    </div>
    <div class="alert-list">
      ${items.map(({ resource, quantity }) => `
        <div class="alert-item ${quantity < 0 ? 'alert-item--danger' : 'alert-item--warning'}">
          <strong>${resource}</strong>
          <span>${quantity.toFixed(2)} restant${quantity <= 1 ? '' : 's'}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function getCurrentMonthTransactions(transactions) {
  const now = new Date();
  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
}

function getPreviousMonthTransactions(transactions) {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date.getFullYear() === lastMonth.getFullYear() && date.getMonth() === lastMonth.getMonth();
  });
}

// Suivi de conversation avec contexte
let conversationHistory = [];
const MAX_HISTORY = 50;

function addToConversationHistory(question, answer) {
  conversationHistory.push({ question, answer, timestamp: new Date() });
  if (conversationHistory.length > MAX_HISTORY) {
    conversationHistory.shift();
  }
  localStorage.setItem('bdsi-conversation-history', JSON.stringify(conversationHistory));
}

function loadConversationHistory() {
  try {
    const savedHistory = JSON.parse(localStorage.getItem('bdsi-conversation-history') || '[]');
    conversationHistory = Array.isArray(savedHistory)
      ? savedHistory.filter((item) => item && item.question && item.answer).slice(-MAX_HISTORY)
      : [];
  } catch (error) {
    conversationHistory = [];
  }
}

function restoreConversationMessages() {
  const target = chatMessages || chatMessagesFullscreen;
  if (!target || !conversationHistory.length) return;
  target.innerHTML = '';
  conversationHistory.forEach((item) => {
    addChatMessage(item.question, true, target);
    addChatMessage(item.answer, false, target);
    addAssistantFollowups(item.question, target);
  });
}

function getAssistantFollowups(question) {
  const normalized = String(question || '').toLowerCase();
  if (/stock|rupture|réappro|alerte/.test(normalized)) {
    return ['/predict', '/restock', 'Quel est mon stock actuel ?'];
  }
  if (/vente|chiffre|ca|revenu/.test(normalized)) {
    return ['Compare mes ventes avec le mois dernier', 'Quels sont mes produits les plus vendus ?', '/anomalies'];
  }
  if (/achat|dépense|bénéfice|marge/.test(normalized)) {
    return ['/profitability', 'Combien ai-je dépensé ce mois ?', '/report monthly'];
  }
  return ['/stats', '/alerts', '/help'];
}

function addAssistantFollowups(question, targetContainer) {
  if (!targetContainer) return;
  const followups = document.createElement('div');
  followups.className = 'assistant-followups';
  followups.setAttribute('aria-label', 'Questions de suivi suggérées');
  getAssistantFollowups(question).forEach((prompt) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'assistant-followup';
    button.textContent = prompt;
    button.addEventListener('click', () => {
      if (targetContainer === chatMessagesFullscreen && assistantInputFullscreen) {
        assistantInputFullscreen.value = prompt;
        assistantFormFullscreen?.requestSubmit();
      } else if (assistantInput && assistantForm) {
        assistantInput.value = prompt;
        assistantForm.requestSubmit();
      }
    });
    followups.appendChild(button);
  });
  targetContainer.appendChild(followups);
  targetContainer.scrollTop = targetContainer.scrollHeight;
}

function getConversationContext() {
  if (conversationHistory.length === 0) return '';
  const lastItem = conversationHistory[conversationHistory.length - 1];
  return `Dernière question: "${lastItem.question}"`;
}

// Suggestions de questions basées sur l'historique
function getSuggestedQuestions(transactions) {
  const suggestions = [];
  
  if (transactions.length > 0) {
    const hasSales = transactions.some(t => t.type === 'vente');
    const hasPurchases = transactions.some(t => t.type === 'achat');
    
    if (hasSales) {
      suggestions.push('Quel est mon chiffre d\'affaires ce mois ?');
      suggestions.push('Quels sont mes produits les plus vendus ?');
    }
    
    if (hasPurchases) {
      suggestions.push('Quelle est ma marge bénéficiaire ?');
    }
    
    suggestions.push('Quel est mon stock actuel ?');
    suggestions.push('Donne-moi les statistiques globales');
  }
  
  if (conversationHistory.length > 0) {
    const lastQuestion = conversationHistory[conversationHistory.length - 1].question.toLowerCase();
    if (lastQuestion.includes('vente') || lastQuestion.includes('chiffre')) {
      suggestions.push('Compare mes ventes avec le mois dernier');
    }
    if (lastQuestion.includes('stock')) {
      suggestions.push('Y a-t-il des alertes de stock ?');
    }
  }
  
  return [...new Set(suggestions)].slice(0, 5);
}

// Export des réponses en PDF/Excel
function exportReportToPDF(report) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Rapport Business de Sidi', 14, 20);
    doc.setFontSize(12);
    doc.text(`Période: ${report.period}`, 14, 30);
    doc.text(`Du ${report.startDate} au ${report.endDate}`, 14, 38);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 46);
    
    doc.setFontSize(14);
    doc.text('Résumé financier', 14, 60);
    
    doc.setFontSize(10);
    doc.text(`Chiffre d'affaires: ${formatCurrency(report.totalRevenue)}`, 14, 70);
    doc.text(`Dépenses: ${formatCurrency(report.totalCost)}`, 14, 78);
    doc.text(`Bénéfice: ${formatCurrency(report.profit)}`, 14, 86);
    doc.text(`Marge: ${report.margin}%`, 14, 94);
    
    doc.text(`Opérations totales: ${report.operationCount}`, 14, 102);
    doc.text(`Ventes: ${report.salesCount}`, 14, 110);
    doc.text(`Achats: ${report.purchaseCount}`, 14, 118);
    
    doc.text(`Top ressource: ${report.topResource}`, 14, 126);
    
    doc.save(`rapport-${report.period}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Erreur export PDF:', error);
  }
}

function exportReportToExcel(report) {
  const data = [
    ['Métrique', 'Valeur'],
    ['Période', report.period],
    ['Date début', report.startDate],
    ['Date fin', report.endDate],
    ['Chiffre d\'affaires', formatCurrency(report.totalRevenue)],
    ['Dépenses', formatCurrency(report.totalCost)],
    ['Bénéfice', formatCurrency(report.profit)],
    ['Marge (%)', report.margin],
    ['Opérations totales', report.operationCount],
    ['Ventes', report.salesCount],
    ['Achats', report.purchaseCount],
    ['Top ressource', report.topResource],
    ['Quantité top ressource', report.topResourceQty]
  ];
  
  const csvContent = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rapport-${report.period}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Graphiques interactifs dans les réponses
let assistantChart = null;

function renderAssistantChart(chartType, transactions) {
  const assistantResponse = document.getElementById('assistant-response');
  if (!assistantResponse) return;

  // Remove existing chart
  const existingChart = document.getElementById('assistant-chart');
  if (existingChart) existingChart.remove();

  const chartContainer = document.createElement('div');
  chartContainer.id = 'assistant-chart';
  chartContainer.style.marginTop = '20px';
  chartContainer.style.height = '300px';
  
  const canvas = document.createElement('canvas');
  chartContainer.appendChild(canvas);
  assistantResponse.appendChild(chartContainer);

  if (assistantChart) assistantChart.destroy();

  let chartData, chartConfig;

  if (chartType === 'sales') {
    const salesByResource = {};
    transactions.filter(t => t.type === 'vente').forEach(t => {
      salesByResource[t.resource] = (salesByResource[t.resource] || 0) + Number(t.quantity || 0);
    });
    
    chartData = {
      labels: Object.keys(salesByResource),
      datasets: [{
        label: 'Ventes par ressource',
        data: Object.values(salesByResource),
        backgroundColor: ['#6c5ce7', '#f72585', '#00b894', '#fdcb6e', '#4facfe', '#e17055']
      }]
    };
    
    chartConfig = {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    };
  } else if (chartType === 'trend') {
    const months = getMonthsList(6);
    const profitData = [];
    
    months.forEach((month) => {
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        return key === month.key && (t.type === 'achat' || t.type === 'vente');
      });
      
      const spent = monthTransactions.reduce((acc, t) => acc + (t.type === 'achat' ? parseNumericValue(t.total) : 0), 0);
      const earned = monthTransactions.reduce((acc, t) => acc + (t.type === 'vente' ? parseNumericValue(t.total) : 0), 0);
      profitData.push(earned - spent);
    });

    chartData = {
      labels: months.map(m => m.label),
      datasets: [{
        label: 'Bénéfice',
        data: profitData,
        borderColor: '#00b894',
        backgroundColor: 'rgba(0, 184, 148, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
    
    chartConfig = {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };
  } else if (chartType === 'distribution') {
    const resourceSummary = buildResourceSummary(transactions);
    const data = Object.entries(resourceSummary).map(([resource, value]) => ({
      label: resource,
      value: Math.abs(value)
    }));

    chartData = {
      labels: data.map(d => d.label),
      datasets: [{
        data: data.map(d => d.value),
        backgroundColor: ['#6c5ce7', '#f72585', '#00b894', '#fdcb6e', '#4facfe', '#e17055']
      }]
    };
    
    chartConfig = {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    };
  }

  assistantChart = new Chart(canvas, chartConfig);
}

// Partage de rapports par email
function shareReportByEmail(report) {
  const subject = encodeURIComponent(`Rapport Business de Sidi - ${report.period}`);
  const body = encodeURIComponent(`
📊 Rapport Business de Sidi
📅 ${report.startDate} - ${report.endDate}

💰 Chiffre d'affaires: ${formatCurrency(report.totalRevenue)}
🛒 Dépenses: ${formatCurrency(report.totalCost)}
📈 Bénéfice: ${formatCurrency(report.profit)}
📋 Opérations: ${report.operationCount}

Généré depuis l'application Business de Sidi
  `.trim());
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// Personnalisation des réponses selon le profil utilisateur
function personalizeResponse(response, userProfile) {
  if (!userProfile) return response;
  
  const userName = userProfile.name || '';
  const farmName = userProfile.farm || '';
  
  if (userName && !response.includes(userName)) {
    response = response.replace(/Votre|votre/g, `${userName}, votre`);
  }
  
  if (farmName) {
    response = response.replace(/votre ferme|votre entreprise/g, farmName);
  }
  
  return response;
}

function prepareAssistantTransaction(question) {
  const normalized = String(question || '').trim();
  if (!/\b(pr[eé]pare|pr[eé]parer|ajoute|ajouter|enregistre|enregistrer)\b/i.test(normalized)) return null;

  const typeMatch = normalized.match(/\b(achat|acheter|vente|vendre)\b/i);
  if (!typeMatch) return null;

  const type = /achat|acheter/i.test(typeMatch[1]) ? 'achat' : 'vente';
  const quantityMatch = normalized.match(/(?:quantit[eé]|qte)\s*(?:de|[:=])?\s*(\d+(?:[.,]\d+)?)/i);
  const priceMatch = normalized.match(/prix(?:\s+unitaire)?\s*(?:de|[:=])?\s*(\d+(?:[.,]\d+)?)/i);
  const resourceMatch = normalized.match(/\b(?:de|pour)\s+(.+?)\s+(?=(?:quantit[eé]|qte|prix)\b)/i);

  if (!quantityMatch || !priceMatch || !resourceMatch) {
    return 'Je peux préparer le brouillon sans l’enregistrer. Précise le type, la ressource, la quantité et le prix unitaire, par exemple : « Prépare une vente de maïs quantité 12 prix 450 ». ';
  }

  const resource = resourceMatch[1]
    .replace(/^(?:un|une|des|du|de la|de l['’])\s*/i, '')
    .trim();
  const quantity = parseNumericValue(quantityMatch[1]);
  const unitPrice = parseNumericValue(priceMatch[1]);
  if (!resource || quantity <= 0 || unitPrice <= 0) {
    return 'Le brouillon n’a pas été préparé : vérifie que la ressource, la quantité et le prix unitaire sont valides.';
  }

  if (!form || !typeSelect) return 'Le formulaire d’opération n’est pas disponible pour préparer ce brouillon.';
  typeSelect.value = type;
  typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  document.getElementById('resource').value = resource;
  document.getElementById('quantity').value = String(quantity);
  unitPriceInput.value = String(unitPrice);
  const noteInput = document.getElementById('note');
  if (noteInput && !noteInput.value.trim()) noteInput.value = 'Brouillon préparé par l’assistant';
  if (dateInput && !dateInput.value) setDefaultDate();
  setStockMode.checked = false;
  closeChatFullscreen();
  closeMenu();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('resource').focus({ preventScroll: true });

  return `Brouillon préparé : ${type === 'achat' ? 'achat' : 'vente'} de ${resource}, ${quantity} unité(s) à ${formatCurrency(unitPrice)} l’unité. Rien n’a été enregistré. Vérifie les champs puis clique sur « Enregistrer » pour confirmer.`;
}

function getAssistantAnswer(question, transactions) {
  const normalized = (question || '').toLowerCase();
  const monthTransactions = getCurrentMonthTransactions(transactions);
  const resourceSummary = buildResourceSummary(transactions);
  const threshold = Number(alertThresholdInput?.value || 0);
  const lowStockItems = Object.entries(resourceSummary)
    .filter(([, value]) => value <= threshold)
    .sort((a, b) => a[1] - b[1]);

  const spent = monthTransactions.reduce((acc, item) => acc + (item.type === 'achat' ? Number(item.total || 0) : 0), 0);
  const earned = monthTransactions.reduce((acc, item) => acc + (item.type === 'vente' ? Number(item.total || 0) : 0), 0);
  const profit = earned - spent;

  const draftAnswer = prepareAssistantTransaction(question);
  if (draftAnswer) return draftAnswer;

  if (!transactions.length && !/^(?:\/help|\/aide)$/.test(normalized.trim())) {
    return 'Aucune donnée n’est encore enregistrée. Ajoute une opération pour obtenir un aperçu.';
  }

  if (/\/export/.test(normalized)) {
    downloadCSV(transactions);
    return '📄 Export CSV en cours...';
  }
  
  if (/\/stats/.test(normalized)) {
    return `📊 Statistiques:\n💰 CA: ${formatCurrency(earned)}\n📦 Dépenses: ${formatCurrency(spent)}\n📈 Bénéfice: ${formatCurrency(profit)}\n🔢 Opérations: ${transactions.length}`;
  }
  
  if (/\/help/.test(normalized)) {
    return `📚 Commandes disponibles:\n/export - Exporter CSV\n/stats - Afficher statistiques\n/help - Afficher aide\n\nQuestions:\n"Quel est mon CA ce mois ?"\n"Quels sont mes produits les plus vendus ?"\n"Quel est mon stock actuel ?"`;
  }

  // Mode conversationnel en langage naturel - Questions spécifiques
  if (/combien|combien j'ai|j'ai vendu|quantité|combien de/.test(normalized) && /tomates|carottes|oignons|pommes|bananes|oranges|maïs|riz|blé|/.test(normalized)) {
    const resourceMatch = normalized.match(/tomates|carottes|oignons|pommes|bananes|oranges|maïs|riz|blé/);
    if (resourceMatch) {
      const resource = resourceMatch[0];
      const sales = transactions.filter(t => t.type === 'vente' && t.resource.toLowerCase().includes(resource));
      const totalQty = sales.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
      return `Vous avez vendu ${totalQty.toFixed(2)} unités de ${resource}.`;
    }
  }

  if (/combien|combien j'ai|j'ai gagné|revenu|argent/.test(normalized) && /aujourd'hui|cette semaine|ce mois|cette année/.test(normalized)) {
    if (/aujourd'hui/.test(normalized)) {
      const today = new Date().toISOString().split('T')[0];
      const todaySales = transactions.filter(t => t.type === 'vente' && t.date.startsWith(today));
      const todayEarned = todaySales.reduce((sum, t) => sum + Number(t.total || 0), 0);
      return `Aujourd'hui, vous avez gagné ${formatCurrency(todayEarned)}.`;
    }
    if (/cette semaine/.test(normalized)) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekSales = transactions.filter(t => t.type === 'vente' && new Date(t.date) >= weekAgo);
      const weekEarned = weekSales.reduce((sum, t) => sum + Number(t.total || 0), 0);
      return `Cette semaine, vous avez gagné ${formatCurrency(weekEarned)}.`;
    }
  }

  if (/quel est mon stock|combien il me reste|stock actuel|reste/.test(normalized)) {
    const stockDetails = Object.entries(resourceSummary).slice(0, 5).map(([r, s]) => `${r}: ${s.toFixed(2)}`).join(', ');
    return `Votre stock actuel: ${stockDetails}.`;
  }

  if (/quelle ressource|quel produit|le plus vendu|top vente/.test(normalized)) {
    const salesByResource = {};
    transactions.filter(t => t.type === 'vente').forEach(t => {
      salesByResource[t.resource] = (salesByResource[t.resource] || 0) + Number(t.quantity || 0);
    });
    const sorted = Object.entries(salesByResource).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      return `La ressource la plus vendue est ${sorted[0][0]} avec ${sorted[0][1].toFixed(2)} unités.`;
    }
    return 'Aucune vente enregistrée.';
  }

  if (/meilleur jour|jour le plus rentable|jour record/.test(normalized)) {
    const salesByDate = {};
    transactions.filter(t => t.type === 'vente').forEach(t => {
      const date = t.date.substring(0, 10);
      salesByDate[date] = (salesByDate[date] || 0) + Number(t.total || 0);
    });
    const sorted = Object.entries(salesByDate).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      return `Votre meilleur jour était le ${sorted[0][0]} avec ${formatCurrency(sorted[0][1])}.`;
    }
    return 'Aucune vente enregistrée.';
  }

  if (/combien d'opérations|nombre d'opérations|combien de ventes/.test(normalized)) {
    const salesCount = transactions.filter(t => t.type === 'vente').length;
    const purchasesCount = transactions.filter(t => t.type === 'achat').length;
    return `Vous avez ${salesCount} ventes et ${purchasesCount} achats (${transactions.length} opérations totales).`;
  }

  if (/prix moyen|coût moyen/.test(normalized)) {
    const sales = transactions.filter(t => t.type === 'vente');
    if (sales.length > 0) {
      const avgPrice = sales.reduce((sum, t) => sum + Number(t.unitPrice || 0), 0) / sales.length;
      return `Le prix moyen de vente est ${formatCurrency(avgPrice)}.`;
    }
    return 'Aucune vente enregistrée.';
  }

  if (/moyenne quotidienne|vente par jour/.test(normalized)) {
    const sales = transactions.filter(t => t.type === 'vente');
    if (sales.length > 0) {
      const totalRevenue = sales.reduce((sum, t) => sum + Number(t.total || 0), 0);
      const uniqueDays = new Set(sales.map(t => t.date.substring(0, 10))).size;
      const dailyAvg = uniqueDays > 0 ? totalRevenue / uniqueDays : 0;
      return `La moyenne quotidienne de ventes est ${formatCurrency(dailyAvg)}.`;
    }
    return 'Aucune vente enregistrée.';
  }

  // Commandes avancées
  if (normalized === '/stats' || normalized === '/statistiques') {
    const totalSpent = transactions.reduce((acc, item) => acc + (item.type === 'achat' ? Number(item.total || 0) : 0), 0);
    const totalEarned = transactions.reduce((acc, item) => acc + (item.type === 'vente' ? Number(item.total || 0) : 0), 0);
    const totalProfit = totalEarned - totalSpent;
    const avgSale = transactions.filter(t => t.type === 'vente').length > 0 
      ? totalEarned / transactions.filter(t => t.type === 'vente').length 
      : 0;
    
    return `📊 **Statistiques globales**
• Opérations totales: ${transactions.length}
• Chiffre d'affaires total: ${formatCurrency(totalEarned)}
• Dépenses totales: ${formatCurrency(totalSpent)}
• Bénéfice total: ${formatCurrency(totalProfit)}
• Vente moyenne: ${formatCurrency(avgSale)}
• Ressources différentes: ${Object.keys(resourceSummary).length}
• Alertes actives: ${lowStockItems.length}`;
  }

  if (normalized === '/forecast' || normalized === '/prévisions') {
    const salesByMonth = {};
    transactions.filter(t => t.type === 'vente').forEach(t => {
      const month = t.date.substring(0, 7);
      salesByMonth[month] = (salesByMonth[month] || 0) + Number(t.total || 0);
    });
    
    const months = Object.keys(salesByMonth).sort().slice(-3);
    const avgMonthlySales = months.length > 0 
      ? months.reduce((sum, m) => sum + salesByMonth[m], 0) / months.length 
      : 0;
    
    const trend = months.length >= 2 
      ? salesByMonth[months[months.length - 1]] > salesByMonth[months[months.length - 2]] 
        ? '📈 en hausse' 
        : '📉 en baisse'
      : '➡️ stable';
    
    return `🔮 **Prévisions de ventes**
• Moyenne mensuelle (3 derniers mois): ${formatCurrency(avgMonthlySales)}
• Tendance: ${trend}
• Prévision mois prochain: ${formatCurrency(avgMonthlySales * 1.1)}
• Recommandation: ${avgMonthlySales > 0 ? 'Maintenir le stock actuel' : 'Augmenter les efforts commerciaux'}`;
  }

  if (normalized === '/trends' || normalized === '/tendances') {
    const salesByResource = {};
    transactions.filter(t => t.type === 'vente').forEach(t => {
      salesByResource[t.resource] = (salesByResource[t.resource] || 0) + Number(t.quantity || 0);
    });
    
    const sorted = Object.entries(salesByResource).sort((a, b) => b[1] - a[1]);
    const topResource = sorted[0];
    const bottomResource = sorted[sorted.length - 1];
    
    return `📈 **Analyse des tendances**
• Ressource la plus vendue: ${topResource ? topResource[0] + ' (' + topResource[1].toFixed(2) + ')' : 'N/A'}
• Ressource la moins vendue: ${bottomResource ? bottomResource[0] + ' (' + bottomResource[1].toFixed(2) + ')' : 'N/A'}
• Total ressources: ${sorted.length}
• Concentration: ${sorted.length > 0 ? (sorted[0][1] / sorted.reduce((sum, [,q]) => sum + q, 0) * 100).toFixed(1) + '% sur le top 1' : 'N/A'}`;
  }

  if (normalized.startsWith('/compare ')) {
    const resources = normalized.replace('/compare ', '').split(' et ');
    if (resources.length < 2) {
      return 'Usage: /compare ressource1 et ressource2';
    }
    
    const r1 = resources[0].trim().toLowerCase();
    const r2 = resources[1].trim().toLowerCase();
    
    const r1Sales = transactions.filter(t => t.type === 'vente' && t.resource.toLowerCase() === r1);
    const r2Sales = transactions.filter(t => t.type === 'vente' && t.resource.toLowerCase() === r2);
    
    const r1Total = r1Sales.reduce((sum, t) => sum + Number(t.total || 0), 0);
    const r2Total = r2Sales.reduce((sum, t) => sum + Number(t.total || 0), 0);
    const r1Qty = r1Sales.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
    const r2Qty = r2Sales.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
    
    return `⚖️ **Comparaison: ${resources[0]} vs ${resources[1]}**
• Chiffre d'affaires: ${formatCurrency(r1Total)} vs ${formatCurrency(r2Total)}
• Quantité vendue: ${r1Qty.toFixed(2)} vs ${r2Qty.toFixed(2)}
• Ventes: ${r1Sales.length} vs ${r2Sales.length}
• Prix moyen: ${r1Sales.length ? formatCurrency(r1Total / r1Sales.length) : 'N/A'} vs ${r2Sales.length ? formatCurrency(r2Total / r2Sales.length) : 'N/A'}`;
  }

  if (normalized.startsWith('/best ')) {
    const period = normalized.replace('/best ', '').trim();
    let filteredTransactions = transactions;
    
    if (period === 'semaine' || period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    } else if (period === 'mois' || period === 'month') {
      filteredTransactions = monthTransactions;
    }
    
    const sales = filteredTransactions.filter(t => t.type === 'vente');
    if (!sales.length) return `Aucune vente sur cette période (${period}).`;
    
    const bestSale = sales.reduce((best, t) => Number(t.total || 0) > Number(best.total || 0) ? t : best, sales[0]);
    const salesByResource = {};
    sales.forEach(t => {
      salesByResource[t.resource] = (salesByResource[t.resource] || 0) + Number(t.quantity || 0);
    });
    const topResource = Object.entries(salesByResource).sort((a, b) => b[1] - a[1])[0];
    
    return `🏆 **Meilleures ventes (${period})**
• Meilleure vente: ${bestSale.resource} (${formatCurrency(bestSale.total)})
• Top ressource: ${topResource[0]} (${topResource[1].toFixed(2)} unités)
• Total ventes: ${sales.length}
• CA total: ${formatCurrency(sales.reduce((sum, t) => sum + Number(t.total || 0), 0))}`;
  }

  if (normalized === '/alerts' || normalized === '/alertes') {
    if (!lowStockItems.length) {
      return '✅ Aucune alerte active. Tous les stocks sont au-dessus du seuil.';
    }
    
    const alertDetails = lowStockItems.map(([resource, stock]) => {
      const severity = stock <= threshold * 0.5 ? '🔴 Critique' : stock <= threshold * 0.75 ? '🟡 Attention' : '🟠 Modéré';
      return `• ${resource}: ${stock.toFixed(2)} (${severity})`;
    }).join('\n');
    
    return `⚠️ **Alertes actives (${lowStockItems.length})**\n${alertDetails}\n\n💡 Action recommandée: Réapprovisionner les ressources critiques.`;
  }

  if (normalized === '/help' || normalized === '/aide') {
    return `📚 **Commandes disponibles**
• /stats - Statistiques globales
• /forecast - Prévisions de ventes
• /trends - Analyse des tendances
• /compare X et Y - Comparer deux ressources
• /best [semaine|mois] - Meilleures ventes
• /alerts - Liste des alertes actives
• /anomalies - Détection des ventes inhabituelles
• /restock - Recommandations de réapprovisionnement
• /profitability - Analyse de rentabilité par ressource
• /predict - Prédictions de rupture de stock
• /active - Ressources les plus actives
• /report [weekly|monthly|annual] - Générer un rapport
• /compare-year - Comparaison avec l'année précédente
• /export [pdf|excel] - Exporter le rapport actuel
• /chart [sales|trend|distribution] - Afficher un graphique interactif
• /email - Partager le rapport par email

**Questions en langage naturel:**
• "Quel est mon chiffre d'affaires ce mois ?"
• "Quels sont mes produits les plus vendus ?"
• "Quelle est ma marge bénéficiaire ?"
• "Compare mes ventes avec le mois dernier"`;
  }

  // Graphiques interactifs
  if (normalized.startsWith('/chart ')) {
    const chartType = normalized.replace('/chart ', '').trim();
    const validTypes = ['sales', 'trend', 'distribution'];
    
    if (!validTypes.includes(chartType)) {
      return 'Types disponibles: sales, trend, distribution';
    }
    
    renderAssistantChart(chartType, transactions);
    return `📈 Graphique ${chartType} affiché ci-dessous.`;
  }

  // Partage par email
  if (normalized === '/email' || normalized === '/mail') {
    const report = generateAutoReport(transactions, 'monthly');
    shareReportByEmail(report);
    return '📧 Client email ouvert avec le rapport pré-rempli.';
  }

  // Export des réponses
  if (normalized.startsWith('/export ')) {
    const format = normalized.replace('/export ', '').trim();
    const report = generateAutoReport(transactions, 'monthly');
    
    if (format === 'pdf' || format === 'pdf') {
      exportReportToPDF(report);
      return '📄 Rapport exporté en PDF.';
    } else if (format === 'excel' || format === 'xlsx') {
      exportReportToExcel(report);
      return '📊 Rapport exporté en Excel.';
    } else {
      return 'Usage: /export pdf ou /export excel';
    }
  }

  // Ressources les plus actives
  if (normalized === '/active' || normalized === '/actif') {
    const activeResources = getMostActiveResources(transactions);
    if (!activeResources.length) {
      return 'Aucune donnée d\'activité disponible.';
    }
    
    const topActive = activeResources.slice(0, 5);
    const activeDetails = topActive.map(r => 
      `• ${r.resource}: ${r.operationCount} opérations (${formatCurrency(r.totalValue)})`
    ).join('\n');
    
    return `📊 **Ressources les plus actives**\n${activeDetails}`;
  }

  // Rapports automatiques
  if (normalized.startsWith('/report ')) {
    const period = normalized.replace('/report ', '').trim();
    const report = generateAutoReport(transactions, period);
    
    return `📋 **Rapport ${report.period}** (${report.startDate} - ${report.endDate})
• Chiffre d'affaires: ${formatCurrency(report.totalRevenue)}
• Dépenses: ${formatCurrency(report.totalCost)}
• Bénéfice: ${formatCurrency(report.profit)}
• Marge: ${report.margin}%
• Opérations: ${report.operationCount}
• Ventes: ${report.salesCount}
• Achats: ${report.purchaseCount}
• Top ressource: ${report.topResource} (${report.topResourceQty.toFixed(2)})`;
  }

  // Comparaison année précédente
  if (normalized === '/compare-year' || normalized === '/comparaison-année') {
    const comparison = compareWithPreviousYear(transactions);
    
    return `📅 **Comparaison annuelle**
• Année ${comparison.currentYear}: ${formatCurrency(comparison.currentRevenue)}
• Année ${comparison.lastYear}: ${formatCurrency(comparison.lastYearRevenue)}
• Différence: ${formatCurrency(comparison.difference)}
• Évolution: ${comparison.trend} (${comparison.percentage}%)
• Opérations ${comparison.currentYear}: ${comparison.currentOperations}
• Opérations ${comparison.lastYear}: ${comparison.lastYearOperations}`;
  }

  // Anomalies de ventes
  if (normalized === '/anomalies' || normalized === '/anomalie') {
    const anomalies = detectSalesAnomalies(transactions);
    if (!anomalies.length) {
      return '✅ Aucune anomalie détectée. Les ventes sont normales.';
    }
    
    const anomalyDetails = anomalies.map(a => 
      `• ${a.date}: ${formatCurrency(a.amount)} (+${a.deviation}% vs moyenne)`
    ).join('\n');
    
    return `🚨 **Anomalies détectées (${anomalies.length})**\n${anomalyDetails}\n\n💡 Ces ventes sont significativement au-dessus de la moyenne.`;
  }

  // Recommandations de réapprovisionnement
  if (normalized === '/restock' || normalized === '/réapprovisionnement') {
    const recommendations = getRestockRecommendations(transactions);
    if (!recommendations.length) {
      return '✅ Aucun réapprovisionnement nécessaire. Tous les stocks sont au-dessus du seuil.';
    }
    
    const recDetails = recommendations.slice(0, 5).map(r => 
      `• ${r.resource}: ${r.currentStock.toFixed(2)} (${r.urgency})\n  - Vente/jour (30 derniers jours): ${r.avgDailySales.toFixed(2)}\n  - Jours restants estimés: ${Number.isFinite(r.daysUntilEmpty) ? r.daysUntilEmpty : 'indéterminé (pas de ventes récentes)'}\n  - Commande suggérée pour 14 jours: ${r.suggestedOrder > 0 ? r.suggestedOrder : 'à définir (ventes récentes insuffisantes)'}`
    ).join('\n\n');
    
    return `📦 **Recommandations de réapprovisionnement**\n${recDetails}`;
  }

  // Analyse de rentabilité
  if (normalized === '/profitability' || normalized === '/rentabilité') {
    const profitability = analyzeResourceProfitability(transactions);
    if (!profitability.length) {
      return 'Aucune donnée de rentabilité disponible.';
    }
    
    const topProfit = profitability.slice(0, 3);
    const bottomProfit = profitability.slice(-3).reverse();
    
    const topDetails = topProfit.map(p => 
      `• ${p.resource}: ${formatCurrency(p.profit)} (${p.margin.toFixed(1)}% marge)`
    ).join('\n');
    
    const bottomDetails = bottomProfit.map(p => 
      `• ${p.resource}: ${formatCurrency(p.profit)} (${p.margin.toFixed(1)}% marge)`
    ).join('\n');
    
    return `💰 **Analyse de rentabilité**\n\n🏆 Top ressources:\n${topDetails}\n\n📉 Ressources moins rentables:\n${bottomDetails}`;
  }

  // Prédictions de rupture de stock
  if (normalized === '/predict' || normalized === '/prédictions') {
    const predictions = predictStockOut(transactions);
    if (!predictions.length) {
      return '✅ Aucune rupture de stock prédue dans les 2 prochaines semaines.';
    }
    
    const predDetails = predictions.slice(0, 5).map(p => 
      `• ${p.resource}: ${p.currentStock.toFixed(2)} restants\n  - Vente/jour: ${p.avgDailySales}\n  - Rupture prévue: ${p.predictedDate} (${p.daysUntilEmpty} jours)\n  - Risque: ${p.risk}`
    ).join('\n\n');
    
    return `🔮 **Prédictions de rupture de stock (tendance des 30 derniers jours)**\n${predDetails}`;
  }

  // Chiffre d'affaires ce mois
  if (/(chiffre d'affaires|ca|revenu total|ventes totales)/.test(normalized) && /(ce mois|mois)/.test(normalized)) {
    return `Votre chiffre d'affaires ce mois est de ${formatCurrency(earned)}.`;
  }

  if (/(stock|ressource)/.test(normalized) && /(bas|faible|plus bas|alerte)/.test(normalized)) {
    if (!lowStockItems.length) {
      return 'Aucune ressource ne dépasse actuellement le seuil d’alerte.';
    }
    const [resource, stock] = lowStockItems[0];
    return `La ressource la plus faible est ${resource} avec ${Number(stock).toFixed(2)} restant${Number(stock) <= 1 ? '' : 's'}.`;
  }

  // Produits les plus vendus
  if (/(produit|article|ressource)/.test(normalized) && /(plus vendu|top vente|meilleure vente|best seller)/.test(normalized)) {
    const salesByProduct = {};
    transactions.filter(t => t.type === 'vente').forEach(t => {
      salesByProduct[t.resource] = (salesByProduct[t.resource] || 0) + Number(t.quantity || 0);
    });
    const sorted = Object.entries(salesByProduct).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (!sorted.length) return 'Aucune vente enregistrée.';
    return `Top ventes : ${sorted.map(([p, q]) => `${p} (${q.toFixed(2)})`).join(', ')}.`;
  }

  // Produits en rupture de stock
  if (/(rupture|épuisé|vide|plus bas)/.test(normalized) && /(stock|ressource)/.test(normalized)) {
    if (!lowStockItems.length) {
      return 'Aucun produit en rupture de stock.';
    }
    const summaryText = lowStockItems.slice(0, 5).map(([resource, stock]) => `${resource} (${Number(stock).toFixed(2)})`).join(', ');
    return `Produits en stock bas : ${summaryText}.`;
  }

  // Marge bénéficiaire
  if (/(marge|bénéfice|profit)/.test(normalized)) {
    const totalSpent = transactions.reduce((acc, item) => acc + (item.type === 'achat' ? Number(item.total || 0) : 0), 0);
    const totalEarned = transactions.reduce((acc, item) => acc + (item.type === 'vente' ? Number(item.total || 0) : 0), 0);
    const margin = totalEarned > 0 ? ((totalEarned - totalSpent) / totalEarned * 100).toFixed(1) : 0;
    return `Votre marge bénéficiaire est de ${margin}% (${formatCurrency(totalEarned - totalSpent)}).`;
  }

  // Comparaison avec le mois dernier
  if (/(compare|comparaison|évolution|différence)/.test(normalized) && /(mois dernier|mois précédent)/.test(normalized)) {
    const lastMonth = getPreviousMonthTransactions(transactions);
    const lastMonthEarned = lastMonth.reduce((acc, item) => acc + (item.type === 'vente' ? Number(item.total || 0) : 0), 0);
    const diff = earned - lastMonthEarned;
    const percent = lastMonthEarned > 0 ? ((diff / lastMonthEarned) * 100).toFixed(1) : 0;
    const trend = diff >= 0 ? 'en hausse' : 'en baisse';
    return `Comparaison : ${formatCurrency(earned)} ce mois vs ${formatCurrency(lastMonthEarned)} le mois dernier (${trend} de ${Math.abs(percent)}%).`;
  }

  // Questions existantes
  if (/(bénéfice|profit|gain)/.test(normalized)) {
    return `Votre bénéfice ${monthTransactions.length ? 'ce mois' : 'sur les données disponibles'} est de ${formatCurrency(profit)}.`;
  }

  if (/(dépens|dépense|achat)/.test(normalized) && /(ce mois|mois)/.test(normalized)) {
    return `Vous avez dépensé ${formatCurrency(spent)} en achats ce mois.`;
  }

  if (/(revenu|vente|gagné)/.test(normalized) && /(ce mois|mois)/.test(normalized)) {
    return `Vos ventes ce mois représentent ${formatCurrency(earned)}.`;
  }

  if (/(stock|ressource)/.test(normalized) && /(bas|faible|plus bas|alerte)/.test(normalized)) {
    if (!lowStockItems.length) {
      return 'Aucune ressource ne dépasse actuellement le seuil d’alerte.';
    }
    const [resource, stock] = lowStockItems[0];
    return `La ressource la plus faible est ${resource} avec ${Number(stock).toFixed(2)} restant${Number(stock) <= 1 ? '' : 's'}.`;
  }

  if (/(opération|historique|nombre)/.test(normalized)) {
    return `Vous avez ${transactions.length} opération${transactions.length > 1 ? 's' : ''} enregistrée${transactions.length > 1 ? 's' : ''}.`;
  }

  if (/(alerte|seuil)/.test(normalized)) {
    if (!lowStockItems.length) {
      return 'Aucune alerte de stock pour le moment.';
    }
    const summaryText = lowStockItems.slice(0, 3).map(([resource, stock]) => `${resource} (${Number(stock).toFixed(2)})`).join(', ');
    return `Alertes de stock : ${summaryText}.`;
  }

  if (/(meilleure|plus grande|plus gros|plus élevée)/.test(normalized) && /(vente|vente)/.test(normalized)) {
    const sales = transactions.filter((item) => item.type === 'vente' && Number(item.total || 0) > 0);
    if (!sales.length) {
      return 'Aucune vente enregistrée pour le moment.';
    }
    const bestSale = sales.reduce((best, item) => (Number(item.total || 0) > Number(best.total || 0) ? item : best), sales[0]);
    return `La meilleure vente est ${bestSale.resource} pour ${formatCurrency(Number(bestSale.total || 0))}.`;
  }

  if (/(dernier|récent|recent)/.test(normalized)) {
    const latest = transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (!latest) {
      return 'Aucune opération récente à afficher.';
    }
    return `La dernière opération est ${formatType(latest.type)} de ${latest.resource} le ${formatDate(latest.date)}.`;
  }

  return 'Je peux répondre à des questions comme : "Quel est mon chiffre d\'affaires ce mois ?", "Quels sont mes produits les plus vendus ?" ou "Quelle est ma marge bénéficiaire ?". Tapez /help pour voir toutes les commandes.';
}

// Intégration du contexte et personnalisation dans la réponse
function getAssistantAnswerWithContext(question, transactions) {
  const userProfile = JSON.parse(localStorage.getItem('bdsi-user') || '{}');
  let answer = getAssistantAnswer(question, transactions);
  
  // Personnaliser la réponse
  answer = personalizeResponse(answer, userProfile);

  const validDates = transactions
    .map((item) => new Date(item.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b);
  const period = validDates.length
    ? `${validDates[0].toLocaleDateString('fr-FR')} au ${validDates[validDates.length - 1].toLocaleDateString('fr-FR')}`
    : 'aucune date disponible';
  answer += `\n\nℹ️ Analyse calculée localement à partir de ${transactions.length} opération${transactions.length === 1 ? '' : 's'} (${period}). Vérifie que l’historique est à jour.`;
  
  // Ajouter à l'historique
  addToConversationHistory(question, answer);
  
  return answer;
}

// Détection automatique des anomalies de ventes
function detectSalesAnomalies(transactions) {
  const sales = transactions.filter(t => t.type === 'vente');
  if (sales.length < 5) return [];

  const salesByDate = {};
  sales.forEach(t => {
    const date = t.date.substring(0, 10);
    salesByDate[date] = (salesByDate[date] || 0) + Number(t.total || 0);
  });

  const dailySales = Object.values(salesByDate);
  const mean = dailySales.reduce((sum, val) => sum + val, 0) / dailySales.length;
  const stdDev = Math.sqrt(dailySales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailySales.length);
  const threshold = mean + (2 * stdDev);

  const anomalies = Object.entries(salesByDate)
    .filter(([date, amount]) => amount > threshold)
    .map(([date, amount]) => ({
      date,
      amount,
      deviation: ((amount - mean) / mean * 100).toFixed(1)
    }));

  return anomalies;
}

// Système de recommandations de réapprovisionnement
function getRecentSalesRates(transactions, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const quantities = {};

  transactions.forEach((item) => {
    const date = new Date(item.date);
    if (item.type !== 'vente' || Number.isNaN(date.getTime()) || date < cutoff || date > new Date()) return;
    quantities[item.resource] = (quantities[item.resource] || 0) + parseNumericValue(item.quantity);
  });

  return Object.fromEntries(Object.entries(quantities).map(([resource, quantity]) => [resource, quantity / days]));
}

function getRestockRecommendations(transactions, threshold = 5) {
  const resourceSummary = buildResourceSummary(transactions);
  const dailySalesByResource = getRecentSalesRates(transactions);

  const recommendations = Object.entries(resourceSummary)
    .filter(([resource, stock]) => stock <= threshold)
    .map(([resource, stock]) => {
      const avgDailySales = dailySalesByResource[resource] || 0;
      const daysUntilEmpty = avgDailySales > 0 ? Math.max(0, Math.floor(stock / avgDailySales)) : Infinity;
      const urgency = daysUntilEmpty <= 3 ? '🔴 Critique' : daysUntilEmpty <= 7 ? '🟠 Urgent' : '🟡 Modéré';
      
      return {
        resource,
        currentStock: stock,
        avgDailySales,
        daysUntilEmpty,
        urgency,
        suggestedOrder: Math.max(0, Math.ceil((avgDailySales * 14) - Math.max(0, stock)))
      };
    })
    .sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty);

  return recommendations;
}

// Analyse de rentabilité par ressource
function analyzeResourceProfitability(transactions) {
  const resourceData = {};
  
  transactions.forEach(t => {
    if (!resourceData[t.resource]) {
      resourceData[t.resource] = { revenue: 0, cost: 0, quantity: 0 };
    }
    
    if (t.type === 'vente') {
      resourceData[t.resource].revenue += Number(t.total || 0);
      resourceData[t.resource].quantity += Number(t.quantity || 0);
    } else if (t.type === 'achat') {
      resourceData[t.resource].cost += Number(t.total || 0);
    }
  });

  return Object.entries(resourceData)
    .map(([resource, data]) => ({
      resource,
      revenue: data.revenue,
      cost: data.cost,
      profit: data.revenue - data.cost,
      margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue * 100) : 0,
      quantity: data.quantity,
      avgPrice: data.quantity > 0 ? data.revenue / data.quantity : 0
    }))
    .sort((a, b) => b.profit - a.profit);
}

// Prédictions de rupture de stock
function predictStockOut(transactions, threshold = 5) {
  const resourceSummary = buildResourceSummary(transactions);
  const dailySalesByResource = getRecentSalesRates(transactions);

  const predictions = Object.entries(resourceSummary)
    .filter(([resource, stock]) => stock <= threshold * 2 || (dailySalesByResource[resource] || 0) > 0)
    .map(([resource, stock]) => {
      const dailySales = dailySalesByResource[resource] || 0;
      const daysUntilEmpty = dailySales > 0 ? Math.max(0, Math.floor(stock / dailySales)) : Infinity;
      const predictedDate = daysUntilEmpty !== Infinity 
        ? new Date(Date.now() + daysUntilEmpty * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
        : 'N/A';

      return {
        resource,
        currentStock: stock,
        avgDailySales: dailySales.toFixed(2),
        daysUntilEmpty,
        predictedDate,
        risk: daysUntilEmpty <= 7 ? 'Élevé' : daysUntilEmpty <= 14 ? 'Modéré' : 'Faible'
      };
    })
    .sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty);

  return predictions
    .filter((prediction) => prediction.daysUntilEmpty <= 14)
    .sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty);
}

// Identification des ressources les plus actives (simulée car pas de données clients/fournisseurs)
function getMostActiveResources(transactions) {
  const resourceActivity = {};
  
  transactions.forEach(t => {
    if (!resourceActivity[t.resource]) {
      resourceActivity[t.resource] = { count: 0, total: 0, types: new Set() };
    }
    resourceActivity[t.resource].count++;
    resourceActivity[t.resource].total += Number(t.total || 0);
    resourceActivity[t.resource].types.add(t.type);
  });

  return Object.entries(resourceActivity)
    .map(([resource, data]) => ({
      resource,
      operationCount: data.count,
      totalValue: data.total,
      types: Array.from(data.types),
      avgValue: data.count > 0 ? data.total / data.count : 0
    }))
    .sort((a, b) => b.operationCount - a.operationCount);
}

// Génération de rapports automatiques
function generateAutoReport(transactions, period = 'monthly') {
  const now = new Date();
  let startDate, endDate;
  
  if (period === 'weekly') {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
    endDate = now;
  } else if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (period === 'annual') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31);
  }

  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= startDate && date <= endDate;
  });

  const sales = filteredTransactions.filter(t => t.type === 'vente');
  const purchases = filteredTransactions.filter(t => t.type === 'achat');
  const totalRevenue = sales.reduce((sum, t) => sum + Number(t.total || 0), 0);
  const totalCost = purchases.reduce((sum, t) => sum + Number(t.total || 0), 0);
  const profit = totalRevenue - totalCost;
  
  const salesByResource = {};
  sales.forEach(t => {
    salesByResource[t.resource] = (salesByResource[t.resource] || 0) + Number(t.quantity || 0);
  });

  const topResource = Object.entries(salesByResource).sort((a, b) => b[1] - a[1])[0];

  return {
    period,
    startDate: startDate.toLocaleDateString('fr-FR'),
    endDate: endDate.toLocaleDateString('fr-FR'),
    totalRevenue,
    totalCost,
    profit,
    operationCount: filteredTransactions.length,
    salesCount: sales.length,
    purchaseCount: purchases.length,
    topResource: topResource ? topResource[0] : 'N/A',
    topResourceQty: topResource ? topResource[1] : 0,
    margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1) : 0
  };
}

// Comparaison avec l'année précédente
function compareWithPreviousYear(transactions) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;

  const currentYearTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === currentYear;
  });

  const lastYearTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === lastYear;
  });

  const currentRevenue = currentYearTransactions
    .filter(t => t.type === 'vente')
    .reduce((sum, t) => sum + Number(t.total || 0), 0);
  
  const lastYearRevenue = lastYearTransactions
    .filter(t => t.type === 'vente')
    .reduce((sum, t) => sum + Number(t.total || 0), 0);

  const diff = currentRevenue - lastYearRevenue;
  const percent = lastYearRevenue > 0 ? ((diff / lastYearRevenue) * 100).toFixed(1) : 0;
  const trend = diff >= 0 ? '📈 en hausse' : '📉 en baisse';

  return {
    currentYear,
    lastYear,
    currentRevenue,
    lastYearRevenue,
    difference: diff,
    percentage: percent,
    trend,
    currentOperations: currentYearTransactions.length,
    lastYearOperations: lastYearTransactions.length
  };
}

function saveFilters() {
  const filters = {
    search: searchInput.value,
    type: historyTypeFilter.value,
    sortField: sortField.value,
    sortOrder: sortOrder.value,
    dateFrom: dateFromInput?.value || '',
    dateTo: dateToInput?.value || '',
    minAmount: minAmountInput?.value || '',
    maxAmount: maxAmountInput?.value || ''
  };
  localStorage.setItem('bdsi-filters', JSON.stringify(filters));
}

function restoreFilters() {
  try {
    const saved = JSON.parse(localStorage.getItem('bdsi-filters') || '{}');
    if (searchInput) searchInput.value = saved.search || '';
    if (historyTypeFilter) historyTypeFilter.value = saved.type || '';
    if (sortField) sortField.value = saved.sortField || 'date';
    if (sortOrder) sortOrder.value = saved.sortOrder || 'desc';
    if (dateFromInput) dateFromInput.value = saved.dateFrom || '';
    if (dateToInput) dateToInput.value = saved.dateTo || '';
    if (minAmountInput) minAmountInput.value = saved.minAmount || '';
    if (maxAmountInput) maxAmountInput.value = saved.maxAmount || '';
  } catch (error) {
    // ignore invalid saved data
  }
}

function fuzzyMatch(text, search) {
  if (!search) return true;
  const normalizedText = text.toLowerCase();
  const normalizedSearch = search.toLowerCase();
  
  // Recherche exacte
  if (normalizedText.includes(normalizedSearch)) return true;
  
  // Recherche floue (caractères dans le bon ordre)
  let searchIndex = 0;
  for (let i = 0; i < normalizedText.length && searchIndex < normalizedSearch.length; i++) {
    if (normalizedText[i] === normalizedSearch[searchIndex]) {
      searchIndex++;
    }
  }
  return searchIndex === normalizedSearch.length;
}

function applyFilters(transactions) {
  const searchValue = searchInput.value.trim();
  const selectedType = historyTypeFilter.value;
  const field = sortField.value;
  const order = sortOrder.value;
  const dateFrom = dateFromInput?.value;
  const dateTo = dateToInput?.value;
  const minAmount = minAmountInput?.value;
  const maxAmount = maxAmountInput?.value;

  return transactions
    .filter((transaction) => {
      const matchesSearch =
        fuzzyMatch(transaction.resource, searchValue) ||
        fuzzyMatch(transaction.note || '', searchValue) ||
        fuzzyMatch(formatType(transaction.type), searchValue);
      const matchesType = selectedType ? transaction.type === selectedType : true;
      
      let matchesDateRange = true;
      if (dateFrom) {
        const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
        matchesDateRange = matchesDateRange && transactionDate >= dateFrom;
      }
      if (dateTo) {
        const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
        matchesDateRange = matchesDateRange && transactionDate <= dateTo;
      }
      
      let matchesAmountRange = true;
      const transactionTotal = Number(transaction.total || 0);
      if (minAmount) {
        matchesAmountRange = matchesAmountRange && transactionTotal >= Number(minAmount);
      }
      if (maxAmount) {
        matchesAmountRange = matchesAmountRange && transactionTotal <= Number(maxAmount);
      }
      
      return matchesSearch && matchesType && matchesDateRange && matchesAmountRange;
    })
    .sort((a, b) => {
      let compare = 0;
      if (field === 'date') {
        compare = new Date(a.date) - new Date(b.date);
      } else {
        compare = a[field] - b[field];
      }
      return order === 'asc' ? compare : -compare;
    });
}

function updateHistoryView() {
  saveFilters();
  const filtered = applyFilters(allTransactions);
  renderHistory(filtered);
}

function getTransactionBalanceImpact(transaction) {
  const total = parseNumericValue(transaction.total || parseNumericValue(transaction.quantity) * parseNumericValue(transaction.unitPrice));
  const direction = transaction.direction || getDefaultDirection(transaction.type);

  if (direction === 'positive') {
    return total;
  }
  if (direction === 'negative') {
    return -total;
  }
  return 0;
}

function getDefaultDirection(type) {
  const normalizedType = String(type || '').trim().toLowerCase();
  if (normalizedType === 'achat' || normalizedType === 'perte') return 'negative';
  if (normalizedType === 'vente') return 'positive';
  if (normalizedType === 'stock') return 'neutral';
  return 'neutral';
}

function downloadCSV(transactions) {
  const header = ['Date', 'Type', 'Ressource', 'Quantité', 'Prix unitaire', 'Total', 'Note'];
  const rows = transactions.map((transaction) => [
    formatDate(transaction.date),
    formatType(transaction.type),
    transaction.resource,
    transaction.quantity,
    transaction.unitPrice,
    transaction.total,
    transaction.note || ''
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'business-de-sidi-historique.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadPDF(transactions) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Business de Sidi - Historique', 14, 20);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
    
    // Table data
    const tableData = transactions.map((transaction) => [
      formatDate(transaction.date),
      formatType(transaction.type),
      transaction.resource,
      parseNumericValue(transaction.quantity).toFixed(2),
      transaction.type === 'stock' ? '-' : formatCurrency(parseNumericValue(transaction.unitPrice)),
      transaction.type === 'stock' ? '-' : formatCurrency(parseNumericValue(transaction.total)),
      transaction.type === 'perte' ? (transaction.lossCause || '-') : '-',
      transaction.note || '-'
    ]);
    
    // Generate table
    doc.autoTable({
      startY: 35,
      head: [['Date', 'Type', 'Ressource', 'Quantité', 'Prix', 'Total', 'Cause perte', 'Note']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 118, 110] }
    });
    
    doc.save('business-de-sidi-historique.pdf');
    showToast('PDF exporté avec succès.', 'success');
  } catch (error) {
    console.error('Erreur export PDF:', error);
    showToast('Erreur lors de l\'export PDF.', 'error');
  }
}

function shareReport(transactions) {
  const totalSales = transactions.filter(t => t.type === 'vente').reduce((acc, t) => acc + Number(t.total || 0), 0);
  const totalPurchases = transactions.filter(t => t.type === 'achat').reduce((acc, t) => acc + Number(t.total || 0), 0);
  const profit = totalSales - totalPurchases;
  const operationCount = transactions.length;
  
  const reportText = `
📊 *Rapport Business de Sidi*
📅 ${new Date().toLocaleDateString('fr-FR')}

💰 *Chiffre d'affaires:* ${formatCurrency(totalSales)}
🛒 *Achats:* ${formatCurrency(totalPurchases)}
📈 *Bénéfice:* ${formatCurrency(profit)}
📋 *Opérations:* ${operationCount}

_Généré depuis l'application Business de Sidi_
  `.trim();
  
  if (navigator.share) {
    navigator.share({
      title: 'Rapport Business de Sidi',
      text: reportText
    }).catch(() => {
      // Fallback to clipboard
      copyToClipboard(reportText);
    });
  } else {
    // Fallback: open WhatsApp with pre-filled text
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(whatsappUrl, '_blank');
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Rapport copié dans le presse-papier', 'success');
  }).catch(() => {
    showToast('Impossible de copier le rapport', 'error');
  });
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[index + 1] === '\n') {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value !== '')) {
        rows.push(row);
      }
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function mapCsvRow(headers, row) {
  const normalizedHeaders = headers.map(normalizeHeader);
  const getValue = (candidateNames) => {
    for (const name of candidateNames) {
      const index = normalizedHeaders.indexOf(normalizeHeader(name));
      if (index >= 0 && row[index] !== undefined) {
        return row[index].trim();
      }
    }
    return '';
  };

  const type = getValue(['type', 'operation', 'transactiontype']);
  const resource = getValue(['resource', 'ressource', 'name']);
  const quantity = parseNumericValue(getValue(['quantity', 'quantite', 'qty']));
  const unitPrice = parseNumericValue(getValue(['unitprice', 'prixunitaire', 'price']));
  const note = getValue(['note', 'commentaire']);
  const date = getValue(['date', 'datetime', 'dateheure']);

  return {
    type: type || 'achat',
    resource,
    quantity,
    unitPrice,
    note,
    date
  };
}

async function importCsvFile(file) {
  if (!file) return;
  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length < 2) {
    showToast('Le fichier CSV est vide.', 'error');
    return;
  }
  const [headers, ...dataRows] = rows;
  const imported = [];

  for (const row of dataRows) {
    const payload = mapCsvRow(headers, row);
    if (!payload.resource) continue;
    const body = {
      type: payload.type.toLowerCase(),
      resource: payload.resource,
      quantity: parseNumericValue(payload.quantity) || 0,
      unitPrice: parseNumericValue(payload.unitPrice) || 0,
      note: payload.note || '',
      date: payload.date ? new Date(payload.date).toISOString() : undefined
    };
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        imported.push(payload);
      }
    } catch (error) {
      showToast('Échec de l’importation en raison d’un problème réseau.', 'error');
      break;
    }
  }

  if (imported.length > 0) {
    await loadData();
    showToast(`${imported.length} opération(s) importée(s).`, 'success');
  } else {
    showToast('Aucune opération n’a pu être importée.', 'error');
  }
}

async function loadData() {
  try {
    allTransactions = await fetchHistory();
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    allTransactions = [];
  }
  updateSummary(allTransactions);
  renderResourceBreakdown(allTransactions);
  renderMonthlyChart(allTransactions);
  renderPieChart(allTransactions);
  renderLineChart(allTransactions);
  renderStockAlerts(allTransactions);
  updateQuickStats();
  updateAlerts();
  triggerLowStockBotAlerts(allTransactions);
  updateHistoryView();
}

function readStoredTheme() {
  const savedTheme = localStorage.getItem('bdsi-theme-mode') || localStorage.getItem('theme') || 'light';
  return savedTheme === 'dark' ? 'dark' : 'light';
}

function persistTheme(mode) {
  const resolvedMode = mode === 'dark' ? 'dark' : 'light';
  localStorage.setItem('bdsi-theme-mode', resolvedMode);
  localStorage.setItem('theme', resolvedMode);
  return resolvedMode;
}

function syncThemeToggleUI() {
  const mode = readStoredTheme();
  const isDark = mode === 'dark';

  [chatThemeToggle, headerThemeToggle].forEach((toggle) => {
    if (!toggle) return;
    toggle.setAttribute('aria-label', isDark ? 'Passer en mode clair' : 'Passer en mode sombre');
    toggle.setAttribute('title', isDark ? 'Mode sombre' : 'Mode clair');
    toggle.dataset.themeMode = mode;
    toggle.setAttribute('data-theme-mode', mode);
    const svg = toggle.querySelector('svg');
    if (svg) {
      svg.style.opacity = '1';
    }
  });

  if (themeToggleBtn) {
    const badge = themeToggleBtn.querySelector('.theme-badge');
    if (badge) badge.textContent = isDark ? 'Sombre' : 'Clair';
    const icon = themeToggleBtn.querySelector('.menu-icon');
    if (icon) icon.textContent = isDark ? '🌙' : '☀️';
  }
}

function applyThemeMode(mode) {
  const resolvedMode = persistTheme(mode);
  document.documentElement.setAttribute('data-theme-mode', resolvedMode);
  if (resolvedMode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  syncThemeToggleUI();

  if (darkModeToggle) darkModeToggle.checked = resolvedMode === 'dark';
}

function updateHeaderGradient(color1, color2) {
  const gradient = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  document.documentElement.style.setProperty('--header-bg', gradient);
  if (colorPreviewBar) colorPreviewBar.style.background = gradient;
}

function previewCustomColors() {
  const color1 = gradient1ColorInput?.value || '#6c5ce7';
  const color2 = gradient2ColorInput?.value || '#f72585';
  updateHeaderGradient(color1, color2);
}

function applyThemePreset(color1, color2) {
  if (gradient1ColorInput) gradient1ColorInput.value = color1;
  if (gradient2ColorInput) gradient2ColorInput.value = color2;
  previewCustomColors();
}

function applyCustomTheme() {
  const color1 = gradient1ColorInput?.value || '#6c5ce7';
  const color2 = gradient2ColorInput?.value || '#f72585';
  const mode = darkModeToggle?.checked ? 'dark' : 'light';
  applyThemeMode(mode);
  document.documentElement.style.setProperty('--accent', color1);
  document.documentElement.style.setProperty('--accent-strong', color2);
  document.documentElement.style.setProperty('--accent-light', color1 + '20');
  updateHeaderGradient(color1, color2);
  localStorage.setItem('bdsi-custom-gradient1', color1);
  localStorage.setItem('bdsi-custom-gradient2', color2);
  localStorage.setItem('bdsi-theme-color', 'custom');
  localStorage.setItem('bdsi-theme-mode', mode);
  showToast('Thème personnalisé appliqué.', 'success');
}

function toggleDarkMode() {
  const mode = darkModeToggle?.checked ? 'dark' : 'light';
  applyThemeMode(mode);
  localStorage.setItem('bdsi-theme-mode', mode);
}

function applyThemeColor(color) {
  const colorMap = {
    'blue': { accent: '#3b82f6', strong: '#2563eb', gradient: ['#3b82f6', '#2563eb'] },
    'green': { accent: '#10b981', strong: '#059669', gradient: ['#10b981', '#059669'] },
    'orange': { accent: '#f97316', strong: '#ea580c', gradient: ['#f97316', '#ea580c'] },
    'pink': { accent: '#ec4899', strong: '#db2777', gradient: ['#ec4899', '#db2777'] },
    'default': { accent: '#6366f1', strong: '#a855f7', gradient: ['#6366f1', '#a855f7'] }
  };
  
  const colors = colorMap[color] || colorMap['default'];
  const gradient = colors.gradient || [colors.accent, colors.strong];
  const headerGlow = colors.accent + '33';
  
  document.documentElement.style.setProperty('--accent', colors.accent);
  document.documentElement.style.setProperty('--accent-strong', colors.strong);
  document.documentElement.style.setProperty('--accent-light', colors.accent + '20');
  document.documentElement.style.setProperty('--header-pill-bg', headerGlow);
  document.documentElement.style.setProperty('--icon-button-bg', headerGlow);
  updateHeaderGradient(gradient[0], gradient[1]);
  
  localStorage.setItem('bdsi-theme-color', color || 'default');
  localStorage.setItem('bdsi-custom-gradient1', gradient[0]);
  localStorage.setItem('bdsi-custom-gradient2', gradient[1]);
}

function updateAdminIndicator() {
  const adminIndicator = document.getElementById('admin-mode-indicator');
  if (adminIndicator) {
    adminIndicator.style.display = isAdminMode ? 'flex' : 'none';
  }

  const adminButtons = document.querySelectorAll('[data-admin-action]');
  adminButtons.forEach(btn => {
    const action = btn.getAttribute('data-admin-action');
    const isToggleButton = action === 'admin-toggle';
    const isEnabled = isAdminMode || isToggleButton;
    btn.style.pointerEvents = isEnabled ? 'auto' : 'none';
    btn.style.opacity = isEnabled ? '1' : '0.5';
  });
  
  // Also update admin badges
  const adminBadges = document.querySelectorAll('.admin-badge');
  adminBadges.forEach(badge => {
    if (isAdminMode) {
      badge.innerHTML = '';
      badge.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))';
      badge.style.color = '#ef4444';
      badge.style.border = '1px solid rgba(239, 68, 68, 0.4)';
    } else {
      badge.innerHTML = '<i class="fas fa-lock"></i>';
      badge.style.background = '';
      badge.style.color = '';
      badge.style.border = '';
    }
  });
}

// Initialize admin state from localStorage
document.addEventListener('DOMContentLoaded', () => {
  isAdminMode = localStorage.getItem('adminMode') === 'true';
  loadConversationHistory();
  restoreConversationMessages();
  updateAdminIndicator();
  updateQuickStats();
  updateAlerts();
  updateFavorites();
  renderCalendar();
});

// Quick Stats
function updateQuickStats() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = allTransactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyRevenue = monthlyTransactions
    .filter(t => t.type === 'vente')
    .reduce((sum, t) => sum + parseNumericValue(t.total), 0);

  const monthlyPurchases = monthlyTransactions
    .filter(t => t.type === 'achat')
    .reduce((sum, t) => sum + parseNumericValue(t.total), 0);

  const margin = monthlyRevenue - monthlyPurchases;
  const previousMonthTransactions = getPreviousMonthTransactions(allTransactions);
  const previousMonthRevenue = previousMonthTransactions
    .filter((t) => t.type === 'vente')
    .reduce((sum, t) => sum + parseNumericValue(t.total), 0);
  const revenueChange = previousMonthRevenue > 0
    ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : null;

  const resourceSummary = buildResourceSummary(allTransactions);
  const totalStock = Object.values(resourceSummary).reduce((sum, val) => sum + parseNumericValue(val), 0);

  // Update stats cards
  const quickCa = document.getElementById('quick-ca');
  const quickOps = document.getElementById('quick-ops');
  const quickStock = document.getElementById('quick-stock');
  const quickMargin = document.getElementById('quick-margin');
  
  if (quickCa) quickCa.textContent = formatCurrency(monthlyRevenue);
  if (quickOps) quickOps.textContent = allTransactions.length;
  if (quickStock) quickStock.textContent = totalStock;
  if (quickMargin) quickMargin.textContent = `${monthlyRevenue > 0 ? ((margin / monthlyRevenue) * 100).toFixed(1) : '0.0'}%`;
  const marginTrend = document.getElementById('margin-trend');
  if (marginTrend) marginTrend.textContent = `Net : ${formatCurrency(margin)}`;
  
  // Update header stats (removed from menu - skip if not exists)
  const headerOps = document.getElementById('header-ops');
  const headerCa = document.getElementById('header-ca');
  if (headerOps) headerOps.textContent = allTransactions.length;
  if (headerCa) headerCa.textContent = formatCurrency(monthlyRevenue);
  
  // Update profile stats
  const profileOps = document.getElementById('profile-ops');
  const profileCa = document.getElementById('profile-ca');
  if (profileOps) profileOps.textContent = allTransactions.length;
  if (profileCa) profileCa.textContent = formatCurrency(monthlyRevenue);
  
  // Compare this month’s sales revenue with the previous calendar month.
  const caTrend = document.getElementById('ca-trend');
  if (caTrend) {
    caTrend.textContent = revenueChange === null ? 'Pas de référence' : `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}% vs mois préc.`;
    caTrend.className = `stat-trend ${revenueChange === null || revenueChange >= 0 ? 'positive' : 'negative'}`;
  }
}

// Alerts
function updateAlerts() {
  const threshold = Number(alertThresholdInput?.value || 5);
  const alertCount = document.getElementById('alert-count');
  const alertBanner = document.getElementById('alert-banner');
  const alerts = getLowStockAlerts(allTransactions, threshold);

  if (alertCount) {
    alertCount.textContent = alerts.length;
  }

  if (alertBanner) {
    alertBanner.classList.toggle('has-alerts', alerts.length > 0);
    alertBanner.setAttribute('aria-label', alerts.length ? `${alerts.length} alertes de stock. Ouvrir l’assistant.` : 'Aucune alerte de stock. Ouvrir l’assistant.');
  }

  if (menuAlertDetail) {
    menuAlertDetail.textContent = alerts.length
      ? alerts.slice(0, 2).map(({ resource, quantity }) => `${resource} : ${Number(quantity).toFixed(1)}`).join(' · ')
      : 'Aucune ressource sous le seuil';
  }
}

// Favorites
let favorites = JSON.parse(localStorage.getItem('bdsi-favorites') || '[]');

function updateFavorites() {
  // The favorites list was removed in the menu redesign
  // This function is kept for compatibility but does nothing
  // Favorites functionality could be re-added if needed
}

function addFavorite() {
  const resource = prompt('Nom de la ressource à ajouter aux favoris:');
  if (resource && resource.trim()) {
    if (!favorites.includes(resource.trim())) {
      favorites.push(resource.trim());
      localStorage.setItem('bdsi-favorites', JSON.stringify(favorites));
      updateFavorites();
      showToast('Favori ajouté', 'success');
    } else {
      showToast('Cette ressource est déjà dans les favoris', 'info');
    }
  }
}

function removeFavorite(index) {
  favorites.splice(index, 1);
  localStorage.setItem('bdsi-favorites', JSON.stringify(favorites));
  updateFavorites();
  showToast('Favori supprimé', 'success');
}

// Calendar
let calendarDate = new Date();

function renderCalendar() {
  // The calendar section was removed in the menu redesign
  // This function is kept for compatibility but does nothing
  // Calendar functionality could be re-added if needed
  return;
}

// Reports
document.querySelectorAll('[data-report]').forEach(btn => {
  btn.addEventListener('click', () => {
    const reportType = btn.getAttribute('data-report');
    showToast(`Génération du rapport ${reportType}...`, 'info');
    // TODO: Implement actual report generation
  });
});

// User Settings Modals
const profileModal = document.getElementById('profile-modal');
const passwordModal = document.getElementById('password-modal');
const preferencesModal = document.getElementById('preferences-modal');

function openModal(modal) {
  modal?.setAttribute('aria-hidden', 'false');
  
  // Load current account info when profile modal opens
  if (modal === profileModal) {
    const currentUser = JSON.parse(localStorage.getItem('bdsi-user') || '{}');
    document.getElementById('current-account-name').textContent = currentUser.name || 'Invité';
    document.getElementById('current-account-email').textContent = currentUser.email || '';
    document.getElementById('current-account-avatar').textContent = (currentUser.name || 'I').charAt(0).toUpperCase();
    
    // Load profile photo if exists
    const savedPhoto = localStorage.getItem('bdsi-profile-photo');
    if (savedPhoto) {
      document.getElementById('profile-photo-preview').innerHTML = `<img src="${savedPhoto}" alt="Profile photo">`;
    }
  }
}

function closeModal(modal) {
  if (!modal) return;

  const activeElement = document.activeElement;
  if (activeElement && modal.contains(activeElement)) {
    activeElement.blur();
  }

  modal.setAttribute('aria-hidden', 'true');
}

document.getElementById('profile-summary')?.addEventListener('click', () => {
  openModal(profileModal);
});

document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
  openModal(profileModal);
});

document.getElementById('change-password-btn')?.addEventListener('click', () => {
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
  openModal(passwordModal);
});

document.getElementById('preferences-btn')?.addEventListener('click', () => {
  // Load saved preferences
  const savedPrefs = JSON.parse(localStorage.getItem('bdsi-preferences') || '{}');
  document.getElementById('pref-currency').value = savedPrefs.currency || 'FCFA';
  document.getElementById('pref-language').value = savedPrefs.language || 'fr';
  document.getElementById('pref-alert-threshold').value = savedPrefs.alertThreshold || 5;
  document.getElementById('pref-notifications').checked = savedPrefs.notifications !== false;
  document.getElementById('pref-auto-save').checked = savedPrefs.autoSave !== false;
  openModal(preferencesModal);
});

// Modal close handlers
document.querySelectorAll('.profile-modal-close, .profile-modal-cancel').forEach(btn => {
  btn.addEventListener('click', () => closeModal(profileModal));
});

document.querySelectorAll('.password-modal-close, .password-modal-cancel').forEach(btn => {
  btn.addEventListener('click', () => closeModal(passwordModal));
});

document.querySelectorAll('.preferences-modal-close, .preferences-modal-cancel').forEach(btn => {
  btn.addEventListener('click', () => closeModal(preferencesModal));
});

// Close modals on overlay click
profileModal?.addEventListener('click', (e) => {
  if (e.target === profileModal) closeModal(profileModal);
});

passwordModal?.addEventListener('click', (e) => {
  if (e.target === passwordModal) closeModal(passwordModal);
});

preferencesModal?.addEventListener('click', (e) => {
  if (e.target === preferencesModal) closeModal(preferencesModal);
});

// Profile edit form submission
document.getElementById('profile-edit-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('edit-name').value;
  const email = document.getElementById('edit-email').value;
  const farm = document.getElementById('edit-farm').value;

  try {
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, farm })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('bdsi-user', JSON.stringify(data));
      updateProfileSummary();
      closeModal(profileModal);
      showToast('Profil mis à jour avec succès', 'success');
    } else {
      const error = await res.json();
      showToast(error.message || 'Erreur lors de la mise à jour', 'error');
    }
  } catch (error) {
    showToast('Erreur de connexion', 'error');
  }
});

// Profile Tabs
document.querySelectorAll('.profile-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.getAttribute('data-tab');
    
    // Update tab buttons
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.profile-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
  });
});

// Switch Account
document.getElementById('switch-account-btn')?.addEventListener('click', () => {
  closeModal(profileModal);
  showToast('Redirection vers la page de connexion...', 'info');
  // Redirect to login or show login form
  window.location.href = '/login';
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    localStorage.removeItem('bdsi-user');
    localStorage.removeItem('bdsi-token');
    window.location.href = '/login';
  } catch (error) {
    showToast('Erreur lors de la déconnexion', 'error');
  }
});

function renderProfilePhoto(dataUrl, fallbackLetter = 'U') {
  const preview = document.getElementById('profile-photo-preview');
  const menuAvatar = document.getElementById('profile-avatar');

  if (!dataUrl) {
    if (preview) preview.innerHTML = `<span id="profile-photo-letter">${fallbackLetter}</span>`;
    if (menuAvatar) menuAvatar.innerHTML = `<span class="avatar-text">${fallbackLetter}</span><div class="avatar-ring"></div>`;
    return;
  }

  const photoMarkup = `<img src="${dataUrl}" alt="Profile photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">`;

  if (preview) preview.innerHTML = photoMarkup;
  if (menuAvatar) menuAvatar.innerHTML = photoMarkup;
}

function compressProfilePhoto(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxDimension = 320;
      const scale = Math.min(1, maxDimension / image.width, maxDimension / image.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    image.onerror = () => reject(new Error('Image invalide'));
    image.src = dataUrl;
  });
}

async function persistProfilePhoto(dataUrl) {
  try {
    localStorage.setItem('bdsi-profile-photo', dataUrl);
    return dataUrl;
  } catch (error) {
    try {
      const compressed = await compressProfilePhoto(dataUrl);
      localStorage.setItem('bdsi-profile-photo', compressed);
      return compressed;
    } catch (compressionError) {
      console.warn('Impossible de sauvegarder la photo de profil:', compressionError);
      return dataUrl;
    }
  }
}

// Profile Photo Upload
document.getElementById('upload-photo-btn')?.addEventListener('click', () => {
  document.getElementById('profile-photo-input').click();
});

document.getElementById('profile-photo-input')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const savedPhoto = await persistProfilePhoto(event.target.result);
      renderProfilePhoto(savedPhoto, 'U');
      showToast('Photo de profil téléchargée', 'success');
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('remove-photo-btn')?.addEventListener('click', () => {
  const currentUser = JSON.parse(localStorage.getItem('bdsi-user') || '{}');
  const letter = (currentUser.name || 'I').charAt(0).toUpperCase();
  renderProfilePhoto(null, letter);
  localStorage.removeItem('bdsi-profile-photo');
  showToast('Photo de profil supprimée', 'info');
});

// Color Presets
document.querySelectorAll('.color-preset').forEach(preset => {
  preset.addEventListener('click', () => {
    const color = preset.getAttribute('data-color');
    
    if (color === 'custom') {
      document.getElementById('custom-color-input').click();
    } else {
      document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
      preset.classList.add('active');
      applyThemeColor(color);
    }
  });
});

const brandLogoPresets = {
  default: '<svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path><circle cx="9" cy="14" r="1"></circle><circle cx="15" cy="14" r="1"></circle></svg>',
  leaf: '<svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 3c-5 1-9 5-10 10-1 5 1 8 5 8 4 0 9-3 10-10 1-5-2-8-5-8Z"></path><path d="M5 19c1-3 3-6 7-8"></path></svg>',
  field: '<svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 19.5h18"></path><path d="M6 15c1.5-3 3.5-5 6-7 2.5 2 4.5 4 6 7"></path><path d="M6 19.5V8"></path><path d="M18 19.5V8"></path></svg>',
  sun: '<svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.93 19.07l1.41-1.41"></path><path d="M17.66 6.34l1.41-1.41"></path></svg>'
};

function setAppTitle(title) {
  const target = document.getElementById('app-main-title');
  if (!target) return;

  const normalizedTitle = (title || '').trim() || 'Plateforme de Gestion Agricole';
  target.textContent = normalizedTitle;
  localStorage.setItem('bdsi-app-title', normalizedTitle);
}

function renderBrandLogo(brandLogo = 'default') {
  const wrapper = document.getElementById('brand-icon-wrapper');
  if (!wrapper) return;

  const customLogo = localStorage.getItem('bdsi-brand-logo-custom');
  if (brandLogo === 'custom' && customLogo) {
    wrapper.innerHTML = `<img class="brand-custom-logo" src="${customLogo}" alt="Logo personnalisé">`;
  } else {
    const selectedLogo = brandLogoPresets[brandLogo] || brandLogoPresets.default;
    wrapper.innerHTML = selectedLogo;
  }

  document.querySelectorAll('.logo-preset').forEach((button) => {
    button.classList.toggle('active', button.getAttribute('data-brand-logo') === brandLogo);
  });
}

function persistBrandLogo(brandLogo = 'default') {
  localStorage.setItem('bdsi-brand-logo', brandLogo);
}

document.querySelectorAll('.logo-preset').forEach((button) => {
  button.addEventListener('click', () => {
    const brandLogo = button.getAttribute('data-brand-logo') || 'default';
    if (brandLogo !== 'custom') {
      localStorage.removeItem('bdsi-brand-logo-custom');
    }
    renderBrandLogo(brandLogo);
    persistBrandLogo(brandLogo);
  });
});

document.getElementById('upload-brand-logo-btn')?.addEventListener('click', () => {
  document.getElementById('brand-logo-input')?.click();
});

document.getElementById('brand-logo-input')?.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const dataUrl = loadEvent.target?.result;
    if (!dataUrl) return;
    localStorage.setItem('bdsi-brand-logo-custom', dataUrl);
    localStorage.setItem('bdsi-brand-logo', 'custom');
    renderBrandLogo('custom');
    showToast('Logo personnalisé ajouté', 'success');
  };
  reader.readAsDataURL(file);
});

document.getElementById('remove-brand-logo-btn')?.addEventListener('click', () => {
  localStorage.removeItem('bdsi-brand-logo-custom');
  localStorage.setItem('bdsi-brand-logo', 'default');
  renderBrandLogo('default');
  showToast('Logo par défaut restauré', 'info');
});

document.getElementById('custom-color-input')?.addEventListener('input', (e) => {
  const color = e.target.value;

  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-strong', color);
  document.documentElement.style.setProperty('--accent-light', color + '40');
  document.documentElement.style.setProperty('--header-pill-bg', color + '33');
  document.documentElement.style.setProperty('--icon-button-bg', color + '33');
  updateHeaderGradient(color, color);

  document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
  const customBtn = document.querySelector('.custom-color-btn');
  if (customBtn) customBtn.classList.add('active');

  localStorage.setItem('bdsi-theme-color', 'custom');
  localStorage.setItem('bdsi-custom-gradient1', color);
  localStorage.setItem('bdsi-custom-gradient2', color);
});

// Save Customization
document.getElementById('save-customization-btn')?.addEventListener('click', () => {
  const avatarStyle = document.getElementById('bot-avatar-style').checked;
  const darkMode = document.getElementById('bot-dark-mode').checked;
  const themeColor = localStorage.getItem('bdsi-theme-color') || 'default';
  const customGradient1 = localStorage.getItem('bdsi-custom-gradient1') || '#6366f1';
  const customGradient2 = localStorage.getItem('bdsi-custom-gradient2') || '#6366f1';
  const brandLogo = localStorage.getItem('bdsi-brand-logo') || 'default';
  const appTitle = document.getElementById('app-title-input')?.value || 'Plateforme de Gestion Agricole';
  
  const customization = {
    avatarStyle,
    darkMode,
    themeColor,
    customGradient1,
    customGradient2,
    brandLogo,
    appTitle
  };
  
  localStorage.setItem('bdsi-customization', JSON.stringify(customization));
  setAppTitle(appTitle);
  showToast('Personnalisation enregistrée', 'success');
  closeModal(profileModal);
});

// Load saved customization
function loadCustomization() {
  const customization = JSON.parse(localStorage.getItem('bdsi-customization') || '{}');

  const savedTitle = customization.appTitle || localStorage.getItem('bdsi-app-title') || 'Plateforme de Gestion Agricole';
  document.getElementById('app-title-input').value = savedTitle;
  setAppTitle(savedTitle);
  
  if (customization.avatarStyle) {
    document.getElementById('bot-avatar-style').checked = true;
  }
  
  if (customization.darkMode) {
    document.getElementById('bot-dark-mode').checked = true;
  }

  const savedBrandLogo = customization.brandLogo || localStorage.getItem('bdsi-brand-logo') || 'default';
  renderBrandLogo(savedBrandLogo);
  persistBrandLogo(savedBrandLogo);

  if (customization.themeColor === 'custom') {
    const customColor = customization.customGradient1 || '#6366f1';
    document.getElementById('custom-color-input')?.setAttribute('value', customColor);
    document.documentElement.style.setProperty('--accent', customColor);
    document.documentElement.style.setProperty('--accent-strong', customColor);
    document.documentElement.style.setProperty('--accent-light', customColor + '40');
    document.documentElement.style.setProperty('--header-pill-bg', customColor + '33');
    document.documentElement.style.setProperty('--icon-button-bg', customColor + '33');
    updateHeaderGradient(customColor, customization.customGradient2 || customColor);
    localStorage.setItem('bdsi-theme-color', 'custom');
    localStorage.setItem('bdsi-custom-gradient1', customColor);
    localStorage.setItem('bdsi-custom-gradient2', customization.customGradient2 || customColor);
  } else if (customization.themeColor) {
    applyThemeColor(customization.themeColor);
  }
  
  const savedPhoto = localStorage.getItem('bdsi-profile-photo');
  if (savedPhoto) {
    renderProfilePhoto(savedPhoto, 'U');
  } else {
    const currentUser = JSON.parse(localStorage.getItem('bdsi-user') || '{}');
    const fallback = (currentUser.name || 'U').charAt(0).toUpperCase();
    renderProfilePhoto(null, fallback);
  }
}

loadCustomization();

// Password change form submission
document.getElementById('password-change-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (newPassword !== confirmPassword) {
    showToast('Les mots de passe ne correspondent pas', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
    return;
  }

  try {
    const res = await fetch('/api/user/password', {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (res.ok) {
      closeModal(passwordModal);
      showToast('Mot de passe changé avec succès', 'success');
    } else {
      const error = await res.json();
      showToast(error.message || 'Erreur lors du changement', 'error');
    }
  } catch (error) {
    showToast('Erreur de connexion', 'error');
  }
});

// Preferences form submission
document.getElementById('preferences-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const preferences = {
    currency: document.getElementById('pref-currency').value,
    language: document.getElementById('pref-language').value,
    alertThreshold: parseInt(document.getElementById('pref-alert-threshold').value),
    notifications: document.getElementById('pref-notifications').checked,
    autoSave: document.getElementById('pref-auto-save').checked
  };

  localStorage.setItem('bdsi-preferences', JSON.stringify(preferences));
  closeModal(preferencesModal);
  showToast('Préférences enregistrées', 'success');

  // Update alert threshold
  updateAlerts();
});

// Feedback
document.getElementById('feedback-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = document.getElementById('feedback-message').value.trim();
  if (message) {
    showToast('Feedback envoyé avec succès!', 'success');
    document.getElementById('feedback-message').value = '';
  }
});

// Calendar navigation
document.getElementById('cal-prev')?.addEventListener('click', () => {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('cal-next')?.addEventListener('click', () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
});

// Add favorite button
document.getElementById('add-favorite-btn')?.addEventListener('click', addFavorite);

function handleAssistantSubmit(event) {
  event.preventDefault();
  const question = assistantInput?.value.trim();
  if (!question) {
    addChatMessage('Écris une question pour commencer.', false);
    return;
  }

  // Add user message to chat
  addChatMessage(question, true);
  
  // Clear input
  if (assistantInput) assistantInput.value = '';

  // Show typing indicator
  showTypingIndicator();

  // Simulate processing delay for better UX
  setTimeout(() => {
    hideTypingIndicator();
    const response = getAssistantAnswerWithContext(question, allTransactions);
    addChatMessage(response, false);
    addAssistantFollowups(question, chatMessages);
  }, 500);
}

function getAssistantHelpText() {
  return `<div class="help-guide">
    <div class="help-mode-tabs">
      <button type="button" class="help-mode-button active" data-help-mode="quick">Mode rapide</button>
      <button type="button" class="help-mode-button" data-help-mode="advanced">Mode avancé</button>
    </div>

    <div class="help-mode-panel active" data-help-panel="quick">
      <h4>Votre assistant d’exploitation</h4>
      <p>L’assistant commercial est le moteur de questions rapides qui lisent ton historique pour te donner un aperçu sur les ventes, les achats, les ressources et le stock.</p>
      <h5>À quoi sert-il ?</h5>
      <p>Tu l’utilises pour demander des chiffres clés sans ouvrir toute l’historique. Il lit les opérations déjà enregistrées et te répond en français.</p>
      <h5>Questions rapides de base</h5>
      <ul>
        <li>“Quel est mon chiffre d’affaires ce mois ?”</li>
        <li>“Quels sont mes produits les plus vendus ?”</li>
        <li>“Quels produits sont en rupture de stock ?”</li>
        <li>“Quelle est ma marge bénéficiaire ?”</li>
        <li>“Compare mes ventes avec le mois dernier”</li>
        <li>“Prépare une vente de maïs quantité 12 prix 450”</li>
      </ul>
      <h5>Accès mobile</h5>
      <p>Ouvre le menu, scanne le QR code avec l’appareil photo Android ou iOS, puis connecte-toi avec ton compte sur le téléphone. Sur un serveur local, les deux appareils doivent être sur le même Wi‑Fi.</p>
      <h5>Questions de suivi</h5>
      <p>Après une réponse, utilise les boutons proposés sous le message pour lancer une analyse complémentaire en un clic.</p>
    </div>

    <div class="help-mode-panel" data-help-panel="advanced">
      <h4>Mode avancé</h4>
      <p>Le bot utilise plusieurs catégories d’informations : achats, ventes, pertes, stock, date, montant total et ressource concernée.</p>
      <h5>Types de demande avancée</h5>
      <ul>
        <li>“Combien j’ai dépensé en achats ce mois ?”</li>
        <li>“Montre-moi le bénéfice sur mes ventes récentes.”</li>
        <li>“Quelles ressources sont en dessous du seuil d’alerte ?”</li>
        <li>“Quelle est la meilleure vente enregistrée ?”</li>
        <li>“Donne-moi la dernière opération faite.”</li>
        <li>“Combien d’opérations ont été enregistrées ?”</li>
      </ul>
      <h5>Ce que le bot analyse</h5>
      <p>Il regarde les transactions de type achat, vente, perte, stock et les classes de direction liées au flux financier. Il calcule ensuite des résultats comme le CA, le bénéfice, les ventes par produit, les ressources faibles et les alertes.</p>
      <h5>Prévisions et recommandations</h5>
      <p><code>/predict</code> estime les ruptures à partir du rythme de vente des 30 derniers jours. <code>/restock</code> suggère une quantité visant environ 14 jours de ventes. Ce sont des estimations, pas des garanties.</p>
      <h5>Brouillon d’achat ou de vente</h5>
      <p>Demande un brouillon avec le type, la ressource, la quantité et le prix unitaire. Exemple : “Prépare une vente de maïs quantité 12 prix 450”. Le bot remplit le formulaire, mais n’enregistre jamais l’opération : vérifie les champs puis confirme avec le bouton Enregistrer.</p>
      <h5>Historique et transparence</h5>
      <p>Le bouton Horloge ouvre les échanges conservés sur cet appareil et Exporter télécharge les questions et réponses. Chaque analyse précise le nombre d’opérations et la période couverte : vérifie que l’historique est complet.</p>
      <h5>Conseils pour obtenir de bonnes réponses</h5>
      <p>Enregistre bien les ressources, les unités, les montants et les dates. Utilise les noms de ressources cohérents comme “Blé”, “Maïs”, “Bovins”, “Aliments”, etc.</p>
    </div>
  </div>`;
}

function showHelpModal() {
  if (helpContent) {
    helpContent.innerHTML = getAssistantHelpText();
    const helpModeButtons = Array.from(document.querySelectorAll('[data-help-mode]'));
    const helpPanels = Array.from(document.querySelectorAll('[data-help-panel]'));

    helpModeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.getAttribute('data-help-mode');
        helpModeButtons.forEach((item) => item.classList.toggle('active', item === button));
        helpPanels.forEach((panel) => panel.classList.toggle('active', panel.getAttribute('data-help-panel') === mode));
      });
    });
  }
  if (helpModal) {
    helpModal.setAttribute('aria-hidden', 'false');
    helpModal.classList.add('open');
  }
}

function hideHelpModal() {
  if (helpModal) {
    helpModal.setAttribute('aria-hidden', 'true');
    helpModal.classList.remove('open');
  }
}

function openMenu() {
  if (menuSearchInput) {
    menuSearchInput.value = '';
    filterMenuSections();
  }
  if (appMenu) {
    appMenu.setAttribute('aria-hidden', 'false');
    appMenu.classList.add('open');
  }
  if (menuOverlay) {
    menuOverlay.setAttribute('aria-hidden', 'false');
    menuOverlay.classList.add('open');
  }
}

function closeMenu() {
  // Blur any focused element inside the menu before hiding it
  // This prevents aria-hidden accessibility issues
  const activeElement = document.activeElement;
  if (activeElement && (appMenu?.contains(activeElement) || menuOverlay?.contains(activeElement))) {
    activeElement.blur();
  }
  
  if (appMenu) {
    appMenu.setAttribute('aria-hidden', 'true');
    appMenu.classList.remove('open');
  }
  if (menuOverlay) {
    menuOverlay.setAttribute('aria-hidden', 'true');
    menuOverlay.classList.remove('open');
  }
}

function openQuickAction(action) {
  closeMenu();
  if (action === 'add-operation') {
    document.getElementById('transaction-form').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('resource').focus();
  }
  if (action === 'set-stock') {
    document.getElementById('setStockMode').checked = true;
    document.getElementById('type').value = 'stock';
    document.getElementById('unitPrice').disabled = true;
    document.getElementById('unitPrice').parentElement.style.display = 'none';
    document.getElementById('transaction-form').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('resource').focus();
  }
  if (action === 'record-loss') {
    document.getElementById('setStockMode').checked = false;
    document.getElementById('type').value = 'perte';
    document.getElementById('unitPrice').disabled = false;
    document.getElementById('unitPrice').parentElement.style.display = 'block';
    document.getElementById('loss-cause-group').style.display = 'block';
    document.getElementById('transaction-form').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('resource').focus();
  }
  if (action === 'history') {
    document.querySelector('.panel--history').scrollIntoView({ behavior: 'smooth' });
  }
  if (action === 'assistant') {
    document.getElementById('assistant-input').focus();
    openMenu();
  }
}

function restoreTheme() {
  const mode = readStoredTheme();
  const color = localStorage.getItem('bdsi-theme-color') || 'default';
  const gradient1 = localStorage.getItem('bdsi-custom-gradient1') || '#6c5ce7';
  const gradient2 = localStorage.getItem('bdsi-custom-gradient2') || '#f72585';

  applyThemeMode(mode);

  if (color === 'custom') {
    document.documentElement.style.setProperty('--accent', gradient1);
    document.documentElement.style.setProperty('--accent-strong', gradient2);
    document.documentElement.style.setProperty('--accent-light', gradient1 + '20');
    updateHeaderGradient(gradient1, gradient2);
  } else {
    applyThemeColor(color);
    updateHeaderGradient(gradient1, gradient2);
  }

  if (gradient1ColorInput) gradient1ColorInput.value = gradient1;
  if (gradient2ColorInput) gradient2ColorInput.value = gradient2;
  if (darkModeToggle) darkModeToggle.checked = mode === 'dark';
  syncThemeToggleUI();
}

gradient1ColorInput?.addEventListener('input', previewCustomColors);
gradient2ColorInput?.addEventListener('input', previewCustomColors);
darkModeToggle?.addEventListener('change', toggleDarkMode);
applyThemeBtn?.addEventListener('click', applyCustomTheme);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const type = typeSelect.value;
  const resource = document.getElementById('resource').value.trim();
  const quantity = parseNumericValue(document.getElementById('quantity').value);
  const unitPrice = parseNumericValue(document.getElementById('unitPrice').value);
  const note = document.getElementById('note').value.trim();
  const date = dateInput.value ? new Date(dateInput.value).toISOString() : undefined;

  if (!resource) {
    showToast('Indique une ressource avant d’enregistrer.', 'error');
    return;
  }

  let payloadType = type;
  if (type === 'custom') {
    const customType = customTypeInput?.value.trim();
    if (!customType) {
      showToast('Saisis un type personnalisé.', 'error');
      return;
    }
    payloadType = customType;
  }

  if (payloadType === 'stock') {
    if (quantity === null || quantity === undefined || quantity === '') {
      showToast('La quantité est obligatoire pour le stock.', 'error');
      return;
    }
  } else if (quantity === null || quantity === undefined || quantity === '' || unitPrice === null || unitPrice === undefined || unitPrice === '') {
    showToast('Quantité et prix unitaire sont requis.', 'error');
    return;
  }

  if (!authToken) {
    showToast('Veuillez vous connecter avant d’enregistrer une opération.', 'error');
    return;
  }

  const lossCause = document.getElementById('loss-cause')?.value;
  const direction = directionSelect?.value || getDefaultDirection(payloadType);
  const threshold = Number(alertThresholdInput?.value || 5);
  const payload = { type: payloadType, resource, quantity, unitPrice, note, date, direction, alertThreshold: threshold };
  if (payloadType === 'perte') {
    payload.lossCause = lossCause || '';
  }
  
  try {
    const response = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Server error');
    }
  } catch (error) {
    console.error('Save error:', error);
    showToast('Enregistrement local impossible, vérifiez votre connexion au serveur.', 'error');
    return;
  }

  form.reset();
  setDefaultDate();
  if (alertThresholdInput) {
    alertThresholdInput.value = String(alertThresholdInput.value || '5');
  }
  await loadData();
  showToast('Opération enregistrée avec succès.', 'success');
});

clearButton?.addEventListener('click', () => {
  form.reset();
  setDefaultDate();
});

setStockMode?.addEventListener('change', () => {
  if (setStockMode.checked) {
    typeSelect.value = 'stock';
    unitPriceInput.disabled = true;
    unitPriceInput.parentElement.style.display = 'none';
  } else {
    if (typeSelect.value === 'stock') typeSelect.value = 'achat';
    unitPriceInput.disabled = false;
    unitPriceInput.parentElement.style.display = '';
  }
});

typeSelect?.addEventListener('change', () => {
  const lossCauseGroup = document.getElementById('loss-cause-group');
  const customTypeGroup = document.getElementById('custom-type-group');
  const isCustom = typeSelect.value === 'custom';

  if (typeSelect.value === 'stock') {
    setStockMode.checked = true;
    unitPriceInput.disabled = true;
    unitPriceInput.parentElement.style.display = 'none';
    lossCauseGroup.style.display = 'none';
    customTypeGroup.style.display = 'none';
    transactionDirectionGroup.style.display = 'none';
    if (directionSelect) directionSelect.value = 'neutral';
  } else if (typeSelect.value === 'perte') {
    setStockMode.checked = false;
    unitPriceInput.disabled = false;
    unitPriceInput.parentElement.style.display = '';
    lossCauseGroup.style.display = 'block';
    customTypeGroup.style.display = 'none';
    transactionDirectionGroup.style.display = 'none';
    if (directionSelect) directionSelect.value = 'negative';
  } else if (isCustom) {
    setStockMode.checked = false;
    unitPriceInput.disabled = false;
    unitPriceInput.parentElement.style.display = '';
    lossCauseGroup.style.display = 'none';
    customTypeGroup.style.display = 'block';
    transactionDirectionGroup.style.display = 'block';
  } else {
    setStockMode.checked = false;
    unitPriceInput.disabled = false;
    unitPriceInput.parentElement.style.display = '';
    lossCauseGroup.style.display = 'none';
    customTypeGroup.style.display = 'none';
    transactionDirectionGroup.style.display = 'none';
    if (directionSelect) {
      directionSelect.value = typeSelect.value === 'vente' ? 'positive' : 'negative';
    }
  }
});

resetDataButton?.addEventListener('click', async () => {
  if (!window.confirm('Confirmer la réinitialisation de toutes les données ?')) return;
  try {
    const res = await fetch('/api/reset', { method: 'POST', headers: getAuthHeaders() });
    if (res.ok) {
      await loadData();
      showToast('Données réinitialisées.', 'success');
    } else {
      showToast('Erreur lors de la réinitialisation.', 'error');
    }
  } catch (error) {
    showToast('Impossible de réinitialiser les données.', 'error');
  }
});

[searchInput, historyTypeFilter, sortField, sortOrder, alertThresholdInput, dateFromInput, dateToInput, minAmountInput, maxAmountInput].forEach((control) => {
  control?.addEventListener('input', updateHistoryView);
});

exportCsvButton?.addEventListener('click', () => {
  downloadCSV(allTransactions);
  showToast('CSV exporté.', 'success');
});

exportExcelButton?.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/export', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Erreur lors de l\'export');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'business-de-sidi-historique.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Excel exporté.', 'success');
  } catch (error) {
    showToast('Erreur lors de l\'export Excel.', 'error');
  }
});

exportPdfButton?.addEventListener('click', () => {
  downloadPDF(allTransactions);
});

menuExportPdf?.addEventListener('click', () => {
  downloadPDF(allTransactions);
  closeMenu();
});

shareReportButton?.addEventListener('click', () => {
  shareReport(allTransactions);
});

importCsvInput?.addEventListener('change', async (event) => {
  const [file] = event.target.files || [];
  if (file) {
    await importCsvFile(file);
    event.target.value = '';
  }
});

assistantForm?.addEventListener('submit', handleAssistantSubmit);
assistantChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    if (assistantInput) assistantInput.value = chip.getAttribute('data-question') || '';
    if (assistantForm) assistantForm.requestSubmit();
  });
});

document.querySelectorAll('.mobile-toolbar__btn').forEach((btn) => {
  btn.addEventListener('click', () => openQuickAction(btn.getAttribute('data-action')));
});

fabButton?.addEventListener('click', () => openQuickAction('add-operation'));

async function triggerInstallFlow() {
  if (!deferredPrompt) {
    showToast('L’installation n’est pas disponible pour le moment. Essayez depuis Chrome, Edge ou Safari.', 'info');
    return;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    showToast('Installation demandée.', 'success');
  }
  deferredPrompt = null;
  installAppButton?.classList.remove('visible');
}

installAppButton?.addEventListener('click', triggerInstallFlow);
installAppMenuButton?.addEventListener('click', () => {
  closeMenu();
  triggerInstallFlow();
});

menuButton?.addEventListener('click', () => {
  const hidden = appMenu && appMenu.getAttribute('aria-hidden') === 'true';
  if (hidden) openMenu(); else closeMenu();
});

menuClose?.addEventListener('click', () => closeMenu());

menuOverlay?.addEventListener('click', (event) => {
  if (event.target === menuOverlay) closeMenu();
});

menuLinks.forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-action');
    closeMenu();
    if (action === 'dashboard') window.scrollTo({ top: 0, behavior: 'smooth' });
    if (action === 'add-operation') document.getElementById('transaction-form').scrollIntoView({ behavior: 'smooth' });
    if (action === 'set-stock') {
      document.getElementById('setStockMode').checked = true;
      document.getElementById('type').value = 'stock';
      document.getElementById('unitPrice').disabled = true;
      document.getElementById('unitPrice').parentElement.style.display = 'none';
      document.getElementById('resource').focus();
    }
    if (action === 'record-loss') {
      document.getElementById('setStockMode').checked = false;
      document.getElementById('type').value = 'perte';
      document.getElementById('unitPrice').disabled = false;
      document.getElementById('unitPrice').parentElement.style.display = 'block';
      document.getElementById('loss-cause-group').style.display = 'block';
      document.getElementById('transaction-form').scrollIntoView({ behavior: 'smooth' });
      document.getElementById('resource').focus();
    }
    if (action === 'history') document.querySelector('.panel--history').scrollIntoView({ behavior: 'smooth' });
    if (action === 'stock-summary') document.querySelector('.resource-breakdown').scrollIntoView({ behavior: 'smooth' });
    if (action === 'help') showHelpModal();
    if (action === 'about') showToast('Business de Sidi — gestion simple de stock et ventes.', 'info');
  });
});

helpModalClose?.addEventListener('click', hideHelpModal);
helpModal?.addEventListener('click', (event) => {
  if (event.target === helpModal) hideHelpModal();
});

menuExportCsv?.addEventListener('click', () => {
  downloadCSV(allTransactions);
  closeMenu();
  showToast('CSV exporté.', 'success');
});

menuExportExcel?.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/export', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Erreur lors de l\'export');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'business-de-sidi-historique.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Excel exporté.', 'success');
    closeMenu();
  } catch (error) {
    showToast('Erreur lors de l\'export Excel.', 'error');
  }
});

// Admin Modal Functions
const adminModal = document.getElementById('admin-modal');
const adminCodeInput = document.getElementById('admin-code');
const modalClose = document.querySelector('.modal-close');
const modalCancel = document.querySelector('.modal-cancel');
const modalConfirm = document.querySelector('.modal-confirm');

let activeAdminAction = 'reset';

function getAdminSecret() {
  return localStorage.getItem(ADMIN_SECRET_KEY) || DEFAULT_ADMIN_SECRET;
}

function setAdminSecret(secret) {
  const cleaned = (secret || '').trim();
  if (!cleaned) return false;
  localStorage.setItem(ADMIN_SECRET_KEY, cleaned);
  return true;
}

function validateAdminSecret(secret) {
  return (secret || '').trim() === getAdminSecret();
}

function showAdminModal(action = 'reset') {
  activeAdminAction = action;
  adminModal?.setAttribute('aria-hidden', 'false');
  adminCodeInput.value = '';
  adminCodeInput.focus();
}

function hideAdminModal() {
  adminModal?.setAttribute('aria-hidden', 'true');
  adminCodeInput.value = '';
}

function validateAdminCode() {
  return validateAdminSecret(adminCodeInput.value);
}

modalClose?.addEventListener('click', hideAdminModal);
modalCancel?.addEventListener('click', hideAdminModal);

adminModal?.addEventListener('click', (e) => {
  if (e.target === adminModal) hideAdminModal();
});

adminCodeInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (validateAdminCode()) {
      hideAdminModal();
      performAdminAction(activeAdminAction);
    } else {
      showToast('Code administrateur incorrect.', 'error');
      adminCodeInput.value = '';
      adminCodeInput.focus();
    }
  }
});

modalConfirm?.addEventListener('click', () => {
  if (validateAdminCode()) {
    hideAdminModal();
    performAdminAction(activeAdminAction);
  } else {
    showToast('Code administrateur incorrect.', 'error');
    adminCodeInput.value = '';
    adminCodeInput.focus();
  }
});

async function performReset() {
  try {
    const res = await fetch('/api/reset', { method: 'POST', headers: getAuthHeaders() });
    if (res.ok) {
      await loadData();
      showToast('Données réinitialisées.', 'success');
    } else {
      showToast('Erreur lors de la réinitialisation.', 'error');
    }
  } catch (error) {
    showToast('Impossible de réinitialiser les données.', 'error');
  }
}

menuAdminButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-admin-action');
    closeMenu();

    if (action === 'admin-toggle') {
      const code = window.prompt('Entrez le code secret pour activer ou désactiver le mode admin :');
      if (code === null) return;
      if (!validateAdminSecret(code)) {
        showToast('Code secret incorrect.', 'error');
        return;
      }
      isAdminMode = !isAdminMode;
      localStorage.setItem('adminMode', String(isAdminMode));
      updateAdminIndicator();
      showToast(isAdminMode ? '✅ Mode admin activé.' : '✅ Mode admin désactivé.', 'success');
      return;
    }

    if (action === 'admin-secret') {
      const currentSecret = window.prompt('Entrez le code secret actuel :');
      if (currentSecret === null) return;
      if (!validateAdminSecret(currentSecret)) {
        showToast('Code secret actuel incorrect.', 'error');
        return;
      }
      const nextSecret = window.prompt('Entrez le nouveau code secret :');
      if (nextSecret === null) return;
      const cleaned = (nextSecret || '').trim();
      if (!cleaned || cleaned.length < 4) {
        showToast('Le nouveau code secret doit contenir au moins 4 caractères.', 'error');
        return;
      }
      setAdminSecret(cleaned);
      showToast('Code secret modifié avec succès.', 'success');
      return;
    }

    if (!isAdminMode) {
      showToast('Mode admin désactivé. Activez le mode admin pour utiliser ces fonctions.', 'error');
      return;
    }

    showAdminModal(action);
  });
});

async function performAdminAction(action) {
  try {
    if (action === 'admin-toggle') {
      isAdminMode = !isAdminMode;
      localStorage.setItem('adminMode', String(isAdminMode));
      updateAdminIndicator();
      showToast(isAdminMode ? '✅ Mode admin activé.' : '✅ Mode admin désactivé.', 'success');
      return;
    }

    if (action === 'admin-secret') {
      const currentSecret = window.prompt('Entrez le code secret actuel :');
      if (currentSecret === null) return;
      if (!validateAdminSecret(currentSecret)) {
        showToast('Code secret actuel incorrect.', 'error');
        return;
      }
      const nextSecret = window.prompt('Entrez le nouveau code secret :');
      if (nextSecret === null) return;
      const cleaned = (nextSecret || '').trim();
      if (!cleaned || cleaned.length < 4) {
        showToast('Le nouveau code secret doit contenir au moins 4 caractères.', 'error');
        return;
      }
      setAdminSecret(cleaned);
      showToast('Code secret modifié avec succès.', 'success');
      return;
    }

    if (action === 'repair') {
      if (!allTransactions.length) {
        showToast('Aucune opération à corriger.', 'info');
        return;
      }

      const list = allTransactions
        .slice(0, 20)
        .map((item, index) => `${index + 1}. ${item.type} • ${item.resource} • ${item.quantity || 0} • ${formatCurrency(item.total || 0)}`)
        .join('\n');

      const selection = Number(window.prompt(`Sélectionnez l’opération à corriger :\n\n${list}\n\nEntrez le numéro...`));
      if (!Number.isFinite(selection) || selection < 1 || selection > allTransactions.length) {
        showToast('Sélection invalide.', 'error');
        return;
      }

      const target = allTransactions[selection - 1];
      const actionChoice = window.prompt('Que voulez-vous faire ?\n1 = Supprimer\n2 = Modifier la quantité\n3 = Modifier le montant', '1');
      if (actionChoice === null) return;

      if (actionChoice === '1') {
        const response = await fetch(`/api/admin/history/${target._id}`, { method: 'DELETE', headers: getAuthHeaders() });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Erreur de suppression');
        await loadData();
        showToast('Opération supprimée.', 'success');
        return;
      }

      if (actionChoice === '2') {
        const newQty = window.prompt('Nouvelle quantité :', String(target.quantity || 0));
        if (newQty === null) return;
        const response = await fetch(`/api/admin/history/${target._id}`, {
          method: 'PATCH',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: Number(newQty) })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Erreur de modification');
        await loadData();
        showToast('Quantité corrigée.', 'success');
        return;
      }

      if (actionChoice === '3') {
        const newTotal = window.prompt('Nouveau montant total :', String(target.total || 0));
        if (newTotal === null) return;
        const response = await fetch(`/api/admin/history/${target._id}`, {
          method: 'PATCH',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ unitPrice: Number(newTotal) / Math.max(Number(target.quantity) || 1, 1) })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Erreur de modification');
        await loadData();
        showToast('Montant corrigé.', 'success');
        return;
      }

      showToast('Choix invalide.', 'error');
      return;
    }

    if (action === 'users') {
      const res = await fetch('/api/admin/users', { method: 'GET', headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      if (!data.length) {
        showToast('Aucun compte enregistré.', 'info');
        return;
      }

      const list = data.map((user, index) => `${index + 1}. ${user.name || user.email} • ${user.email} • ${user.status || 'active'}`).join('\n');
      const selection = Number(window.prompt(`Sélectionnez le compte à gérer :\n\n${list}\n\nEntrez le numéro...`));
      if (!Number.isFinite(selection) || selection < 1 || selection > data.length) {
        showToast('Sélection invalide.', 'error');
        return;
      }

      const target = data[selection - 1];
      const choice = window.prompt('Que voulez-vous faire ?\n1 = Activer/Désactiver\n2 = Supprimer le compte', '1');
      if (choice === null) return;

      if (choice === '1') {
        const nextStatus = (target.status || 'active') === 'active' ? 'blocked' : 'active';
        const patch = await fetch(`/api/admin/users/${target._id}/status`, {
          method: 'PATCH',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
        const patchData = await patch.json().catch(() => ({}));
        if (!patch.ok) throw new Error(patchData.error || 'Erreur');
        showToast(`Compte ${target.email} → ${nextStatus}.`, 'success');
        return;
      }

      if (choice === '2') {
        const confirmDelete = window.confirm(`Supprimer le compte ${target.email} ?`);
        if (!confirmDelete) return;
        const patch = await fetch(`/api/admin/users/${target._id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const patchData = await patch.json().catch(() => ({}));
        if (!patch.ok) throw new Error(patchData.error || 'Erreur');
        showToast('Compte supprimé.', 'success');
        return;
      }

      showToast('Choix invalide.', 'error');
      return;
    }

    showToast('Commande admin inconnue.', 'error');
  } catch (error) {
    showToast(error.message || 'Erreur admin.', 'error');
  }
}

const toggleTheme = () => {
  const currentMode = readStoredTheme();
  const nextMode = currentMode === 'dark' ? 'light' : 'dark';
  applyThemeMode(nextMode);
};

if (chatThemeToggle) {
  chatThemeToggle.addEventListener('click', toggleTheme);
}

if (headerThemeToggle) {
  headerThemeToggle.addEventListener('click', toggleTheme);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleTheme);
}

themeOptions.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.getAttribute('data-theme-mode');
    applyThemeMode(mode);
    if (darkModeToggle) darkModeToggle.checked = mode === 'dark';
  });
});

themeColors.forEach((btn) => {
  btn.addEventListener('click', () => {
    const color = btn.getAttribute('data-color');
    applyThemeColor(color);
  });
});

gradient1ColorInput?.addEventListener('input', previewCustomColors);
gradient2ColorInput?.addEventListener('input', previewCustomColors);
darkModeToggle?.addEventListener('change', toggleDarkMode);
applyThemeBtn?.addEventListener('click', applyCustomTheme);

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installAppButton?.classList.add('visible');
});

window.addEventListener('appinstalled', () => {
  installAppButton?.classList.remove('visible');
  showToast('Application installée.', 'success');
});

restoreTheme();
restoreFilters();
setDefaultDate();
refreshMobileQrCode();
updateProfileSummary();
loadData();
if (window.location.hash === '#assistant') {
  openChatFullscreen();
}
if (assistantResponse) {
  assistantResponse.textContent = 'Pose une question pour obtenir un aperçu rapide de ton activité agricole.';
}

