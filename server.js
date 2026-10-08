require('dotenv').config();
const express = require('express');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { body, validationResult } = require('express-validator');
const webpush = require('web-push');
const multer = require('multer');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const app = express();
const port = process.env.PORT || 3102;
const DATA_DIRECTORY = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const fallbackDataPath = path.join(DATA_DIRECTORY, 'storage.json');
const DEMO_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@local.test';

if (process.env.NODE_ENV === 'production') {
  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32 || /change-this-secret|your-secret-key/i.test(jwtSecret)) {
    throw new Error('Production requires a unique JWT_SECRET of at least 32 characters.');
  }
}

const { authenticateToken, generateToken } = require('./middleware/auth');

// Configure Web Push (optional for development)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:your-email@example.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (error) {
    console.warn('Invalid VAPID keys - push notifications disabled:', error.message);
  }
} else {
  console.log('VAPID keys not configured - push notifications disabled');
}

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


function normalizeNumber(value) {
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

function getServerDefaultDirection(type) {
  const normalizedType = String(type || '').trim().toLowerCase();
  if (normalizedType === 'achat' || normalizedType === 'perte') return 'negative';
  if (normalizedType === 'vente') return 'positive';
  if (normalizedType === 'stock') return 'neutral';
  return 'neutral';
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get(['/login', '/auth'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

function createEmailTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function sendEmailNotification(email, subject, message) {
  if (!email) {
    return false;
  }

  const transporter = createEmailTransport();

  if (!transporter) {
    console.log(`[EMAIL ALERT] To: ${email}\nSubject: ${subject}\n${message}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@agritech.local',
      to: email,
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
    });

    console.log(`Email alert sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email alert failed:', error);
    return false;
  }
}

function getLocalNetworkUrl() {
  const interfaces = os.networkInterfaces();
  const candidates = Object.values(interfaces)
    .flat()
    .filter((entry) => entry && !entry.internal && entry.family === 'IPv4')
    .map((entry) => entry.address);

  return candidates[0] ? `http://${candidates[0]}:${port}` : `http://localhost:${port}`;
}

function getMobileAssistantUrl(req) {
  const configuredUrl = process.env.PUBLIC_APP_URL || process.env.APP_URL;
  if (configuredUrl) {
    return `${String(configuredUrl).trim().replace(/\/+$/, '')}/#assistant`;
  }

  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const directHost = String(req.get('host') || '').trim();
  const hostname = String(req.hostname || '').toLowerCase();
  const isLoopback = ['localhost', '127.0.0.1', '::1'].includes(hostname);

  if (forwardedHost) {
    const protocol = forwardedProto || req.protocol || 'https';
    return `${protocol}://${forwardedHost}/#assistant`;
  }

  if (directHost && !isLoopback) {
    const protocol = forwardedProto || req.protocol || 'http';
    return `${protocol}://${directHost}/#assistant`;
  }

  return `${getLocalNetworkUrl()}/#assistant`;
}

// Auth routes
app.post('/api/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name, farmName } = req.body;
  // Public registration must never grant privileged roles from client input.
  const role = 'member';

  try {
    if (false) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }

      const user = new User({ email, password, name, farmName });
      await user.save();

      const token = generateToken(user);
      res.json({ token, user: { id: user._id, email: user.email, name: user.name, farmName: user.farmName } });
    } else {
      // In-memory user for development
      const existingUser = inMemoryUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }

      const user = {
        _id: Date.now().toString(),
        email,
        password: await bcrypt.hash(password, 12),
        name,
        farmName,
        role,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      inMemoryUsers.push(user);
      const saved = saveFallbackData();
      addAuditEntry('user.registered', user.email, { role });
      console.log('Utilisateur enregistré:', user.email, 'Sauvegarde réussie:', saved);
      console.log('Total utilisateurs:', inMemoryUsers.length);

      const token = generateToken(user);
      res.json({ token, user: { id: user._id, email: user.email, name: user.name, farmName: user.farmName, role: user.role, status: user.status } });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

app.post('/api/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    if (false) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      const token = generateToken(user);
      res.json({ token, user: { id: user._id, email: user.email, name: user.name, farmName: user.farmName } });
    } else {
      // In-memory login for development
      const user = inMemoryUsers.find((entry) => entry.email === email);
      const passwordMatches = user && await verifyPassword(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      if (!isBcryptHash(user.password)) {
        user.password = await bcrypt.hash(password, 12);
        saveFallbackData();
      }

      const token = generateToken(user);
      addAuditEntry('user.login', user.email, { role: user.role || 'member' });
      res.json({ token, user: { id: user._id, email: user.email, name: user.name, farmName: user.farmName, role: user.role || 'member', status: user.status || 'active' } });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

async function requireAdmin(req, res, next) {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentification admin requise' });
    }

    let user = null;
    if (false) {
      user = await User.findById(req.user?.userId);
    } else {
      user = inMemoryUsers.find((entry) => String(entry._id) === String(req.user?.userId));
    }

    if (!user) {
      return res.status(403).json({ error: 'Utilisateur introuvable' });
    }

    // Authorization must be based on the persisted account, never a client-controlled header.
    const normalizedEmail = String(user.email || '').trim().toLowerCase();
    const normalizedRole = String(user.role || '').trim().toLowerCase();
    const isExplicitAdmin = normalizedEmail === String(DEMO_ADMIN_EMAIL).trim().toLowerCase() || ['admin', 'manager'].includes(normalizedRole);

    if (!isExplicitAdmin) {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur de contrôle administrateur' });
  }
}

// User profile and settings routes
app.patch('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, farm } = req.body;
    const userId = req.user?.userId;

    if (false) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

      user.name = name || user.name;
      user.email = email || user.email;
      user.farm = farm || user.farm;
      await user.save();

      res.json({ _id: user._id, name: user.name, email: user.email, farm: user.farm, role: user.role });
    } else {
      const userIndex = inMemoryUsers.findIndex(u => String(u._id) === String(userId));
      if (userIndex === -1) return res.status(404).json({ error: 'Utilisateur introuvable' });

      inMemoryUsers[userIndex].name = name || inMemoryUsers[userIndex].name;
      inMemoryUsers[userIndex].email = email || inMemoryUsers[userIndex].email;
      inMemoryUsers[userIndex].farm = farm || inMemoryUsers[userIndex].farm;

      saveFallbackData();
      res.json(inMemoryUsers[userIndex]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

app.patch('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    if (false) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ message: 'Mot de passe changé avec succès' });
    } else {
      const userIndex = inMemoryUsers.findIndex(u => String(u._id) === String(userId));
      if (userIndex === -1) return res.status(404).json({ error: 'Utilisateur introuvable' });

      const user = inMemoryUsers[userIndex];
      if (!(await verifyPassword(currentPassword, user.password))) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 12);
      saveFallbackData();

      res.json({ message: 'Mot de passe changé avec succès' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
});

app.get('/api/admin/status', authenticateToken, async (req, res) => {
  try {
    let user = null;
    if (false) {
      user = await User.findById(req.user?.userId);
    } else {
      user = inMemoryUsers.find((entry) => String(entry._id) === String(req.user?.userId));
    }

    const isAdmin = Boolean(user && (user.email === DEMO_ADMIN_EMAIL || user.role === 'admin' || user.role === 'manager'));

    res.json({ isAdmin, user: user ? { id: user._id, email: user.email, role: user.role || 'member', status: user.status || 'active' } : null });
  } catch (error) {
    res.status(500).json({ error: 'Erreur de récupération du statut admin' });
  }
});

app.post('/api/admin/backup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [allUsers, allTransactions] = await Promise.all([
      false ? User.find({}).lean() : inMemoryUsers,
      false ? Transaction.find({}).lean() : inMemoryTransactions
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      users: allUsers,
      transactions: allTransactions,
      meta: {
        app: 'business-de-sidi',
        type: 'admin-backup'
      }
    };

    const backupDir = DATA_DIRECTORY;
    fs.mkdirSync(backupDir, { recursive: true });

    const backupFile = path.join(backupDir, 'admin-backup.json');
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    res.json({ ok: true, backupFile, count: allTransactions.length });
  } catch (error) {
    res.status(500).json({ error: 'Impossible de créer la sauvegarde' });
  }
});

app.post('/api/admin/restore', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const backupPath = path.join(DATA_DIRECTORY, 'admin-backup.json');
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Aucune sauvegarde admin trouvée' });
    }

    const raw = fs.readFileSync(backupPath, 'utf8');
    const backup = JSON.parse(raw);

    if (false) {
      await Transaction.deleteMany({});
      await Transaction.insertMany(backup.transactions || []);
      await Promise.all((backup.users || []).map(async (user) => {
        const existing = await User.findById(user._id);
        if (existing) {
          await User.findByIdAndUpdate(user._id, { ...user, password: existing.password });
        } else {
          const newUser = new User(user);
          await newUser.save();
        }
      }));
    } else {
      inMemoryUsers = Array.isArray(backup.users) ? backup.users : [];
      inMemoryTransactions = Array.isArray(backup.transactions) ? backup.transactions : [];
      saveFallbackData();
    }

    res.json({ ok: true, restored: { users: (backup.users || []).length, transactions: (backup.transactions || []).length } });
  } catch (error) {
    res.status(500).json({ error: 'Impossible de restaurer la sauvegarde' });
  }
});

app.post('/api/admin/purge', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const days = Number(req.body.days || req.query.days || 30);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    if (false) {
      const result = await Transaction.deleteMany({
        createdAt: { $lt: cutoff.toISOString() }
      });
      res.json({ ok: true, deleted: result.deletedCount || 0 });
    } else {
      const before = inMemoryTransactions.length;
      inMemoryTransactions = inMemoryTransactions.filter((item) => new Date(item.createdAt || item.date) >= cutoff);
      saveFallbackData();
      res.json({ ok: true, deleted: before - inMemoryTransactions.length });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la purge' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (false) {
      const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
      res.json(users);
    } else {
      const users = inMemoryUsers.map((user) => ({
        _id: user._id,
        email: user.email,
        name: user.name,
        farmName: user.farmName,
        role: user.role || 'member',
        status: user.status || 'active',
        createdAt: user.createdAt
      }));
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

app.patch('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    if (false) {
      const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true, select: '-password' });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }
      res.json({ ok: true, user });
    } else {
      const user = inMemoryUsers.find((entry) => String(entry._id) === String(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }
      user.status = status;
      addAuditEntry('user.status.updated', user.email, { status });
      saveFallbackData();
      res.json({ ok: true, user: { ...user, password: undefined } });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

app.patch('/api/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['admin', 'manager', 'accountant', 'member'];
    const normalizedRole = String(role || '').toLowerCase();
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    const user = inMemoryUsers.find((entry) => String(entry._id) === String(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    user.role = normalizedRole;
    addAuditEntry('user.role.updated', user.email, { role: normalizedRole });
    saveFallbackData();
    res.json({ ok: true, user: { ...user, password: undefined } });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const index = inMemoryUsers.findIndex((user) => String(user._id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const [removedUser] = inMemoryUsers.splice(index, 1);
    saveFallbackData();
    res.json({ ok: true, user: { ...removedUser, password: undefined } });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
  }
});

app.post('/api/admin/stock/recalculate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const summary = await buildResourceSummary(null);
    res.json({ ok: true, summary });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du recalcul du stock' });
  }
});

app.delete('/api/admin/history/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const index = inMemoryTransactions.findIndex((item) => String(item._id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Opération introuvable' });
    }
    const [removed] = inMemoryTransactions.splice(index, 1);
    saveFallbackData();
    res.json({ ok: true, removed });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'opération' });
  }
});

app.patch('/api/admin/history/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const item = inMemoryTransactions.find((entry) => String(entry._id) === String(req.params.id));
    if (!item) {
      return res.status(404).json({ error: 'Opération introuvable' });
    }

    const { quantity, unitPrice, total, resource } = req.body || {};
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unitPrice !== undefined) item.unitPrice = Number(unitPrice);
    if (total !== undefined) item.total = Number(total);
    if (resource !== undefined) item.resource = String(resource).trim();

    if (item.type !== 'stock' && item.quantity !== undefined && item.unitPrice !== undefined) {
      item.total = Number(item.quantity) * Number(item.unitPrice);
    }

    saveFallbackData();
    res.json({ ok: true, item });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la correction de l\'opération' });
  }
});

app.get('/api/admin/audit', authenticateToken, requireAdmin, async (req, res) => {
  try {
    res.json(inMemoryAudit.slice(0, 100));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'audit' });
  }
});

app.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  res.json({
    alertThreshold: 5,
    notificationsEnabled: true,
    stockMode: 'standard'
  });
});

app.patch('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { alertThreshold, notificationsEnabled, stockMode } = req.body;
    const settings = {
      alertThreshold: Number.isFinite(Number(alertThreshold)) ? Number(alertThreshold) : 5,
      notificationsEnabled: notificationsEnabled !== undefined ? Boolean(notificationsEnabled) : true,
      stockMode: stockMode || 'standard'
    };

    const settingsPath = path.join(DATA_DIRECTORY, 'admin-settings.json');
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

    res.json({ ok: true, settings });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
});

app.post('/api/admin/reports/recalculate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let transactions;
    if (false) {
      transactions = await Transaction.find({}).lean();
    } else {
      transactions = inMemoryTransactions;
    }

    const totalRevenue = transactions
      .filter((item) => item.type === 'vente')
      .reduce((acc, item) => acc + Number(item.total || 0), 0);

    const totalPurchases = transactions
      .filter((item) => item.type === 'achat')
      .reduce((acc, item) => acc + Number(item.total || 0), 0);

    const totalLoss = transactions
      .filter((item) => item.type === 'perte')
      .reduce((acc, item) => acc + Number(item.total || 0), 0);

    const summary = {
      revenue: totalRevenue,
      purchases: totalPurchases,
      losses: totalLoss,
      margin: totalRevenue - totalPurchases - totalLoss,
      operationCount: transactions.length,
      generatedAt: new Date().toISOString()
    };

    res.json({ ok: true, summary });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du recalcul des rapports' });
  }
});

// Protected routes
app.get('/api/alerts/stock', authenticateToken, async (req, res) => {
  try {
    const transactions = inMemoryTransactions.filter((transaction) => String(transaction.userId) === String(req.user?.userId));
    const summary = {};

    transactions.forEach((item) => {
      const resource = String(item.resource || '').trim();
      if (!resource) return;

      if (item.type === 'stock') {
        summary[resource] = normalizeNumber(item.quantity);
      } else if (item.type === 'achat') {
        summary[resource] = (summary[resource] || 0) + normalizeNumber(item.quantity);
      } else if (item.type === 'vente' || item.type === 'perte') {
        summary[resource] = (summary[resource] || 0) - normalizeNumber(item.quantity);
      }
    });

    const alerts = Object.entries(summary)
      .map(([resource, stock]) => {
        const threshold = Number(
          transactions
            .filter((item) => String(item.resource || '').trim() === resource)
            .slice(-1)[0]?.alertThreshold || 5
        );

        return {
          resource,
          stock: Number(stock),
          threshold,
          status: Number(stock) <= threshold ? 'low' : 'ok'
        };
      })
      .filter((item) => item.status === 'low');

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des alertes de stock' });
  }
});

app.get('/api/partners', authenticateToken, async (req, res) => {
  try {
    const partners = inMemoryPartners.filter((partner) => String(partner.userId) === String(req.user?.userId));
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des partenaires' });
  }
});

app.post('/api/partners', authenticateToken, [
  body('name').trim().notEmpty(),
  body('type').isIn(['supplier', 'customer'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const partner = {
      _id: Date.now().toString(),
      userId: req.user?.userId,
      name: req.body.name.trim(),
      type: req.body.type,
      phone: req.body.phone || '',
      email: req.body.email || '',
      address: req.body.address || '',
      notes: req.body.notes || '',
      balance: Number(req.body.balance || 0),
      createdAt: new Date().toISOString()
    };

    inMemoryPartners.push(partner);
    saveFallbackData();
    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du partenaire' });
  }
});

app.patch('/api/partners/:id', authenticateToken, async (req, res) => {
  try {
    const partner = inMemoryPartners.find((entry) => String(entry._id) === String(req.params.id) && String(entry.userId) === String(req.user?.userId));
    if (!partner) {
      return res.status(404).json({ error: 'Partenaire introuvable' });
    }

    Object.assign(partner, {
      name: req.body.name ? String(req.body.name).trim() : partner.name,
      type: req.body.type || partner.type,
      phone: req.body.phone !== undefined ? String(req.body.phone) : partner.phone,
      email: req.body.email !== undefined ? String(req.body.email) : partner.email,
      address: req.body.address !== undefined ? String(req.body.address) : partner.address,
      notes: req.body.notes !== undefined ? String(req.body.notes) : partner.notes,
      balance: req.body.balance !== undefined ? Number(req.body.balance) : partner.balance
    });

    saveFallbackData();
    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du partenaire' });
  }
});

app.delete('/api/partners/:id', authenticateToken, async (req, res) => {
  try {
    const index = inMemoryPartners.findIndex((entry) => String(entry._id) === String(req.params.id) && String(entry.userId) === String(req.user?.userId));
    if (index === -1) {
      return res.status(404).json({ error: 'Partenaire introuvable' });
    }

    const [removed] = inMemoryPartners.splice(index, 1);
    saveFallbackData();
    res.json({ ok: true, partner: removed });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du partenaire' });
  }
});

app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = inMemoryProducts.filter((product) => String(product.userId) === String(req.user?.userId));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du catalogue' });
  }
});

app.post('/api/products', authenticateToken, [
  body('name').trim().notEmpty(),
  body('category').optional().trim(),
  body('unit').optional().trim(),
  body('alertThreshold').optional().isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const product = {
      _id: Date.now().toString(),
      userId: req.user?.userId,
      name: String(req.body.name).trim(),
      category: String(req.body.category || 'Autre').trim(),
      unit: String(req.body.unit || 'unité').trim(),
      priceBuy: Number(req.body.priceBuy || 0),
      priceSell: Number(req.body.priceSell || 0),
      alertThreshold: Number(req.body.alertThreshold || 5),
      stock: Number(req.body.stock || 0),
      createdAt: new Date().toISOString()
    };

    inMemoryProducts.push(product);
    addAuditEntry('product.created', product.name, { category: product.category, unit: product.unit });
    saveFallbackData();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
});

app.patch('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = inMemoryProducts.find((entry) => String(entry._id) === String(req.params.id) && String(entry.userId) === String(req.user?.userId));
    if (!product) {
      return res.status(404).json({ error: 'Produit introuvable' });
    }

    if (req.body.name) product.name = String(req.body.name).trim();
    if (req.body.category) product.category = String(req.body.category).trim();
    if (req.body.unit) product.unit = String(req.body.unit).trim();
    if (req.body.priceBuy !== undefined) product.priceBuy = Number(req.body.priceBuy);
    if (req.body.priceSell !== undefined) product.priceSell = Number(req.body.priceSell);
    if (req.body.alertThreshold !== undefined) product.alertThreshold = Number(req.body.alertThreshold);
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);

    addAuditEntry('product.updated', product.name, { id: product._id });
    saveFallbackData();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const index = inMemoryProducts.findIndex((entry) => String(entry._id) === String(req.params.id) && String(entry.userId) === String(req.user?.userId));
    if (index === -1) {
      return res.status(404).json({ error: 'Produit introuvable' });
    }

    const [removed] = inMemoryProducts.splice(index, 1);
    addAuditEntry('product.deleted', removed.name, { id: removed._id });
    saveFallbackData();
    res.json({ ok: true, product: removed });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
});

app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    res.json(inMemoryTransactions.filter((transaction) => String(transaction.userId) === String(req.user?.userId)));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

app.get('/api/dashboard/summary', authenticateToken, async (req, res) => {
  try {
    const transactions = inMemoryTransactions.filter((transaction) => String(transaction.userId) === String(req.user?.userId));
    const summary = {};
    const thresholds = {};

    transactions.forEach((item) => {
      const resourceName = String(item.resource || '').trim();
      if (!resourceName) return;

      if (item.alertThreshold !== undefined && item.alertThreshold !== null && item.alertThreshold !== '') {
        const thresholdValue = Number(item.alertThreshold);
        if (Number.isFinite(thresholdValue)) {
          thresholds[resourceName] = Number.isFinite(thresholds[resourceName])
            ? Math.min(thresholds[resourceName], thresholdValue)
            : thresholdValue;
        }
      }

      if (item.type === 'stock') {
        summary[resourceName] = normalizeNumber(item.quantity);
      } else if (item.type === 'achat') {
        summary[resourceName] = (summary[resourceName] || 0) + normalizeNumber(item.quantity);
      } else if (item.type === 'vente' || item.type === 'perte') {
        summary[resourceName] = (summary[resourceName] || 0) - normalizeNumber(item.quantity);
      }
    });

    const totalRevenue = transactions
      .filter((item) => item.type === 'vente')
      .reduce((acc, item) => acc + normalizeNumber(item.total), 0);

    const totalPurchases = transactions
      .filter((item) => item.type === 'achat')
      .reduce((acc, item) => acc + normalizeNumber(item.total), 0);

    const totalLoss = transactions
      .filter((item) => item.type === 'perte')
      .reduce((acc, item) => acc + normalizeNumber(item.total), 0);

    const totalProfit = totalRevenue - totalPurchases - totalLoss;
    const totalStock = Object.values(summary).reduce((acc, value) => acc + normalizeNumber(value), 0);
    const lowStockAlerts = Object.entries(summary).filter(([resource, stock]) => {
      const threshold = Number(thresholds[resource] || 5);
      return Number(stock) <= threshold;
    }).length;

    const currentMonth = new Date();
    const monthlyTransactions = transactions.filter((item) => {
      const date = new Date(item.date || item.createdAt || Date.now());
      return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
    });

    const monthlyRevenue = monthlyTransactions
      .filter((item) => item.type === 'vente')
      .reduce((acc, item) => acc + normalizeNumber(item.total), 0);

    const monthlyPurchases = monthlyTransactions
      .filter((item) => item.type === 'achat')
      .reduce((acc, item) => acc + normalizeNumber(item.total), 0);

    const monthlyProfit = monthlyRevenue - monthlyPurchases;

    res.json({
      totalRevenue,
      totalPurchases,
      totalLoss,
      totalProfit,
      totalStock,
      operationCount: transactions.length,
      resourceCount: Object.keys(summary).length,
      lowStockAlerts,
      monthlyRevenue,
      monthlyPurchases,
      monthlyProfit,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du calcul du tableau de bord' });
  }
});

app.get('/api/mobile-link', (req, res) => {
  res.json({ url: getMobileAssistantUrl(req) });
});

app.get('/api/export', authenticateToken, async (req, res) => {
  try {
    let transactions;
    if (false) {
      transactions = await Transaction.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
    } else {
      transactions = inMemoryTransactions.filter(
        (transaction) => String(transaction.userId) === String(req.user?.userId)
      );
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historique');

    worksheet.columns = [
      { header: 'Date et heure', key: 'date', width: 25 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Ressource', key: 'resource', width: 22 },
      { header: 'Quantité', key: 'quantity', width: 12 },
      { header: 'Prix unitaire', key: 'unitPrice', width: 16 },
      { header: 'Total', key: 'total', width: 14 },
      { header: 'Cause de la perte', key: 'lossCause', width: 20 },
      { header: 'Note', key: 'note', width: 30 }
    ];

    transactions.forEach((transaction) => {
      worksheet.addRow({
        date: formatDate(transaction.date),
        type: transaction.type,
        resource: transaction.resource,
        quantity: transaction.quantity,
        unitPrice: transaction.unitPrice,
        total: transaction.total,
        lossCause: transaction.lossCause || '',
        note: transaction.note || ''
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=business-de-sidi-historique.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'export' });
  }
});

app.post('/api/history', authenticateToken, [
  body('type').trim().notEmpty(),
  body('direction').optional().isIn(['positive', 'negative', 'neutral']),
  body('resource').trim().notEmpty(),
  body('quantity').optional().isNumeric(),
  body('unitPrice').optional().isNumeric(),
  body('lossCause').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, direction, resource, quantity, unitPrice, note, date, location, alertThreshold, lossCause, partnerId, partnerType, partnerName } = req.body;

  const transactionDirection = direction || getServerDefaultDirection(type);

  // Validation depending on type
  if (type === 'stock') {
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ error: 'quantity est requis pour type=stock' });
    }
  } else {
    if (quantity === undefined || unitPrice === undefined) {
      return res.status(400).json({ error: 'quantity et unitPrice sont requis' });
    }
  }

  const transactionData = {
    type,
    direction: transactionDirection,
    resource: resource.trim(),
    quantity: normalizeNumber(quantity) || 0,
    unitPrice: normalizeNumber(unitPrice) || 0,
    total: type === 'stock' ? 0 : normalizeNumber(quantity) * normalizeNumber(unitPrice),
    note: note?.trim() || '',
    date: date || new Date().toISOString(),
    location: location || null,
    alertThreshold: alertThreshold || 5,
    lossCause: lossCause || null,
    partnerId: partnerId || null,
    partnerType: partnerType || null,
    partnerName: partnerName || null,
    _id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };

  try {
    if (false) {
      const transaction = new Transaction({
        userId: req.user?.userId,
        ...transactionData
      });
      await transaction.save();
      
      // Check if stock is low and send push notification
      if (transaction.type === 'vente' || transaction.type === 'stock') {
        const resourceSummary = await buildResourceSummary(req.user?.userId);
        const currentStock = resourceSummary[resource] || 0;
        if (currentStock <= transaction.alertThreshold) {
          await sendStockAlert(req.user?.userId, resource, currentStock);
        }
      }
      
      res.json(transaction);
    } else {
      // Use in-memory storage for development
      transactionData.userId = req.user?.userId;
      inMemoryTransactions.unshift(transactionData);
      saveFallbackData();
      res.json(transactionData);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la transaction' });
  }
});

// Reset all data for user
app.post('/api/reset', authenticateToken, async (req, res) => {
  try {
    if (false) {
      await Transaction.deleteMany({ userId: req.user?.userId });
    } else {
      inMemoryTransactions = [];
      saveFallbackData();
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Impossible de réinitialiser les données' });
  }
});

// Pagination and advanced filters
app.get('/api/history/paginated', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { type, resource, startDate, endDate, minPrice, maxPrice } = req.query;
    
    let transactions;
    let total;
    
    if (false) {
      const filter = { userId: req.user?.userId };
      
      if (type) filter.type = type;
      if (resource) filter.resource = new RegExp(resource, 'i');
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }
      if (minPrice || maxPrice) {
        filter.total = {};
        if (minPrice) filter.total.$gte = parseFloat(minPrice);
        if (maxPrice) filter.total.$lte = parseFloat(maxPrice);
      }
      
      transactions = await Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      total = await Transaction.countDocuments(filter);
    } else {
      // Simple in-memory filtering
      transactions = inMemoryTransactions.filter((transaction) => String(transaction.userId) === String(req.user?.userId));
      
      if (type) transactions = transactions.filter(t => t.type === type);
      if (resource) transactions = transactions.filter(t => t.resource.toLowerCase().includes(resource.toLowerCase()));
      if (startDate) transactions = transactions.filter(t => new Date(t.date) >= new Date(startDate));
      if (endDate) transactions = transactions.filter(t => new Date(t.date) <= new Date(endDate));
      if (minPrice) transactions = transactions.filter(t => t.total >= parseFloat(minPrice));
      if (maxPrice) transactions = transactions.filter(t => t.total <= parseFloat(maxPrice));
      
      total = transactions.length;
      transactions = transactions.slice(skip, skip + limit);
    }
    
    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// Upload photo
app.post('/api/upload-photo', authenticateToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier uploadé' });
  }
  
  // Convert buffer to base64
  const base64 = req.file.buffer.toString('base64');
  const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
  
  res.json({ photoUrl: dataUrl });
});

// Push notification subscription
app.post('/api/push-subscribe', authenticateToken, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (false) {
      await User.findByIdAndUpdate(req.user?.userId, { pushSubscription: subscription });
    } else {
      const user = inMemoryUsers.find((entry) => String(entry._id) === String(req.user?.userId));
      if (user) {
        user.pushSubscription = subscription;
        saveFallbackData();
      }
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la souscription' });
  }
});

// Export PDF - Temporarily disabled due to jsPDF import issues
// Use Excel export instead which works perfectly
app.get('/api/export-pdf', async (req, res) => {
  res.status(503).json({ error: 'Export PDF temporairement désactivé. Utilisez l\'export Excel.' });
});

// Helper function to build resource summary
async function buildResourceSummary(userId) {
  let transactions;
  if (false) {
    transactions = await Transaction.find({ userId: userId });
  } else {
    transactions = inMemoryTransactions.filter((item) => String(item.userId) === String(userId));
  }

  const summary = {};

  transactions
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((item) => {
      if (item.type === 'stock') {
        summary[item.resource] = normalizeNumber(item.quantity);
      } else if (item.type === 'achat') {
        summary[item.resource] = (summary[item.resource] || 0) + normalizeNumber(item.quantity);
      } else if (item.type === 'vente') {
        summary[item.resource] = (summary[item.resource] || 0) - normalizeNumber(item.quantity);
      } else if (item.type === 'perte') {
        summary[item.resource] = (summary[item.resource] || 0) - normalizeNumber(item.quantity);
      }
    });

  return summary;
}

// Send stock alert via push notification and email
async function sendStockAlert(userId, resource, stock) {
  try {
    const user = inMemoryUsers.find((entry) => String(entry._id) === String(userId));

    if (!user) return;

    const stockMessage = `${resource} est bas (${Number(stock).toFixed(2)} restant). Vérifiez votre stock.`;

    if (user.pushSubscription) {
      await webpush.sendNotification(
        user.pushSubscription,
        JSON.stringify({
          title: 'Alerte de stock',
          body: stockMessage,
          icon: '/logo.svg'
        })
      );
    }

    if (user.email) {
      await sendEmailNotification(
        user.email,
        'Alerte de stock - Business de Sidi',
        `${stockMessage}\n\nRessource: ${resource}\nStock actuel: ${Number(stock).toFixed(2)}`
      );
    }
  } catch (error) {
    console.error('Error sending stock alert:', error);
  }
}

// In-memory storage for local development
function loadFallbackData() {
  try {
    if (!fs.existsSync(fallbackDataPath)) {
      return { users: [], transactions: [], partners: [], products: [], audit: [] };
    }

    const raw = fs.readFileSync(fallbackDataPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      partners: Array.isArray(parsed.partners) ? parsed.partners : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
      audit: Array.isArray(parsed.audit) ? parsed.audit : []
    };
  } catch (error) {
    console.warn('Impossible de charger les données de sauvegarde locale:', error.message);
    return { users: [], transactions: [], partners: [], products: [], audit: [] };
  }
}

function saveFallbackData() {
  try {
    const dir = path.dirname(fallbackDataPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fallbackDataPath, JSON.stringify({
      users: inMemoryUsers,
      transactions: inMemoryTransactions,
      partners: inMemoryPartners,
      products: inMemoryProducts,
      audit: inMemoryAudit
    }, null, 2));
    return true;
  } catch (error) {
    console.warn('Impossible de sauvegarder les données locales:', error.message);
    return false;
  }
}

function addAuditEntry(action, entity, payload = {}) {
  inMemoryAudit.unshift({
    _id: Date.now().toString(),
    action,
    entity,
    payload,
    createdAt: new Date().toISOString()
  });

  if (inMemoryAudit.length > 200) {
    inMemoryAudit = inMemoryAudit.slice(0, 200);
  }

  saveFallbackData();
}

let inMemoryTransactions = [];
let inMemoryUsers = [];
let inMemoryPartners = [];
let inMemoryProducts = [];
let inMemoryAudit = [];

const initialFallbackData = loadFallbackData();
inMemoryUsers = initialFallbackData.users;
inMemoryTransactions = initialFallbackData.transactions;
inMemoryPartners = initialFallbackData.partners;
inMemoryProducts = initialFallbackData.products;
inMemoryAudit = initialFallbackData.audit;

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$/.test(value);
}

async function verifyPassword(password, storedPassword) {
  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(password, storedPassword);
  }
  return storedPassword === password;
}

// Keep persisted local data in development mode so users and operations remain available
// across restarts. Only create a demo account when the file is empty.
if (process.env.NODE_ENV !== 'production') {
  console.log('Mode développement - données locales chargées depuis data/storage.json');
}

const adminUser = inMemoryUsers.find((user) => user.email === DEMO_ADMIN_EMAIL);
if (process.env.NODE_ENV === 'production') {
  const bootstrapPassword = process.env.INITIAL_ADMIN_PASSWORD || '';
  if (!adminUser && bootstrapPassword.length < 12) {
    throw new Error('Set INITIAL_ADMIN_PASSWORD (at least 12 characters) to bootstrap the production administrator.');
  }

  if (adminUser) {
    adminUser.role = 'admin';
    adminUser.status = 'active';
    if (adminUser.password === 'dev-secret') {
      if (bootstrapPassword.length < 12) {
        throw new Error('Replace the demo administrator password using INITIAL_ADMIN_PASSWORD before production.');
      }
      adminUser.password = bcrypt.hashSync(bootstrapPassword, 12);
    }
  } else {
    inMemoryUsers.push({
      _id: 'default-user-id',
      email: DEMO_ADMIN_EMAIL,
      password: bcrypt.hashSync(bootstrapPassword, 12),
      name: 'Administrateur',
      farmName: 'Exploitation',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    });
  }

  inMemoryUsers.forEach((user) => {
    if (user.password && !isBcryptHash(user.password)) {
      user.password = bcrypt.hashSync(user.password, 12);
    }
  });
  // Persist production bootstrap changes and any legacy password migrations.
  saveFallbackData();
} else if (adminUser) {
  adminUser._id = 'default-user-id';
  adminUser.role = 'admin';
  adminUser.status = 'active';
  inMemoryUsers = inMemoryUsers.filter((user) => user._id !== 'default-user-id' || user.email === DEMO_ADMIN_EMAIL);
  saveFallbackData();
} else {
  inMemoryUsers = inMemoryUsers.filter((user) => user._id !== 'default-user-id' || user.email === DEMO_ADMIN_EMAIL);
  inMemoryUsers.push({
    _id: 'default-user-id',
    email: DEMO_ADMIN_EMAIL,
    password: 'dev-secret',
    name: 'Admin local',
    farmName: 'Ferme Démo',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString()
  });
  saveFallbackData();
  console.log('Utilisateur de développement créé avec un compte local de démonstration');
}

const isTestRuntime = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Business de Sidi est lancé: http://localhost:${port}`);
    console.log(`Accessible sur le réseau: http://192.168.137.1:${port}`);
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('fr-FR');
}

module.exports = app;
module.exports.app = app;
module.exports.sendEmailNotification = sendEmailNotification;
module.exports.loadFallbackData = loadFallbackData;
module.exports.saveFallbackData = saveFallbackData;
