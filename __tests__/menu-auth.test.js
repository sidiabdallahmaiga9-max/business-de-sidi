const fs = require('fs');
const path = require('path');

describe('Menu auth/profile integration', () => {
  test('menu authentication and logout use one handler and the existing API routes', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../public/app-enhanced.js'), 'utf8');

    expect(appJs.match(/menuLoginForm\?\.addEventListener\('submit'/g)).toHaveLength(1);
    expect(appJs.match(/menuRegisterForm\?\.addEventListener\('submit'/g)).toHaveLength(1);
    expect(appJs.match(/menuLogoutButton\?\.addEventListener\('click'/g)).toHaveLength(1);
    expect(appJs).not.toMatch(/\/api\/auth\/(login|register)/);
  });

  test('opening the menu clears any previous search filter and restores all sections', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../public/app-enhanced.js'), 'utf8');

    expect(appJs).toMatch(/function filterMenuSections\(searchTerm = ''\)/);
    expect(appJs).toMatch(/menuSearchInput\.value = ''[\s\S]*?filterMenuSections\(\)/);
    expect(appJs).toMatch(/section\.hidden = !sectionMatches/);
    expect(appJs).toMatch(/item\.hidden = !!query/);
  });

  test('the main app menu includes a profile section for login and user info', () => {
    const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');

    expect(html).toMatch(/Profil|Mon profil/i);
    expect(html).toMatch(/Se connecter|Connexion|S\'inscrire|Inscription/i);
  });

  test('the app does not expose offline or deployment setup references', () => {
    const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    const readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8');

    expect(html).not.toMatch(/service-worker|offline|navigator\.serviceWorker|indexeddb|IndexedDB/i);
    expect(readme).not.toMatch(/MongoDB|Render|MONGODB_URI|render\.yaml|mode hors ligne|service worker/i);
  });

  test('the public bot UI does not show stale admin credentials or outdated setup instructions', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../public/app-enhanced.js'), 'utf8');
    const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    const serverJs = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    const readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8');

    expect(appJs).not.toMatch(/admin@business\.com\s*\/\s*admin123|Identifiants de connexion/i);
    expect(html).not.toMatch(/admin@business\.com\s*\/\s*admin123/i);
    expect(serverJs).not.toMatch(/admin@business\.com\s*\/\s*admin123/i);
    expect(readme).not.toMatch(/MongoDB|Render|MONGODB_URI|render\.yaml|mode hors ligne|service worker/i);
  });

  test('the shipped app does not keep legacy offline or service worker references', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../public/app-enhanced.js'), 'utf8');
    const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    const serviceWorker = fs.existsSync(path.join(__dirname, '../public/service-worker.js'))
      ? fs.readFileSync(path.join(__dirname, '../public/service-worker.js'), 'utf8')
      : '';

    expect(appJs).not.toMatch(/service-worker|offline|navigator\.serviceWorker|indexeddb|IndexedDB/i);
    expect(html).not.toMatch(/service-worker|offline|navigator\.serviceWorker|indexeddb|IndexedDB/i);
    expect(serviceWorker).not.toMatch(/offline|service-worker|navigator\.serviceWorker/i);
  });

  test('admin menu exposes a secret-protected mode and hides admin commands from bot help', () => {
    const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    const appJs = fs.readFileSync(path.join(__dirname, '../public/app-enhanced.js'), 'utf8');

    expect(html).toMatch(/Mode admin/i);
    expect(html).toMatch(/Correction d['’]erreur/i);
    expect(html).toMatch(/Gestion des comptes/i);
    expect(appJs).not.toMatch(/\/adminon|\/adminoff|\/reset - Réinitialiser données/i);
  });

  test('the personalization panel exposes logo presets for the header brand icon', () => {
    const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    const appJs = fs.readFileSync(path.join(__dirname, '../public/app-enhanced.js'), 'utf8');

    expect(html).toMatch(/Logo de l['’]en-tête|Logo.*en-tête/i);
    expect(appJs).toMatch(/bdsi-brand-logo|brandLogo/i);
  });
});
