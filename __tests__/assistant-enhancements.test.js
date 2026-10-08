const fs = require('fs');
const path = require('path');

describe('assistant and menu improvements', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../public/app-enhanced.js'), 'utf8');

  test('assistant replies include data scope and recent stock projections use a 30-day window', () => {
    expect(appJs).toMatch(/Analyse calculée localement à partir de/);
    expect(appJs).toMatch(/getRecentSalesRates\(transactions, days = 30\)/);
    expect(appJs).toMatch(/getRestockRecommendations\(transactions, threshold = 5\)/);
  });

  test('assistant transaction drafts require explicit user confirmation before saving', () => {
    expect(appJs).toMatch(/prepareAssistantTransaction\(question\)/);
    expect(appJs).toMatch(/Rien n’a été enregistré/);
    expect(appJs).toMatch(/form\.scrollIntoView/);
  });

  test('menu has search, contextual assistant actions, and a live stock alert summary', () => {
    expect(html).toMatch(/id="menu-search-input"/);
    expect(html).toMatch(/data-assistant-question="\/predict"/);
    expect(html).toMatch(/id="menu-alert-detail"/);
    expect(appJs).toMatch(/menuSearchInput\?\.addEventListener\('input'/);
    expect(appJs).toContain("document.getElementById('alert-banner')?.addEventListener('click'");
  });

  test('assistant chat restores more than a handful of recent conversations', () => {
    expect(appJs).toMatch(/const MAX_HISTORY = 50/);
    expect(appJs).toMatch(/restoreConversationMessages\(\)/);
  });

  test('the menu QR opens the assistant directly and offers a shareable link', () => {
    expect(html).toMatch(/id="mobile-qr-image"/);
    expect(html).toMatch(/id="copy-mobile-link"/);
    expect(html).toMatch(/Android ou iPhone/);
    expect(appJs).toMatch(/window\.location\.hash === '#assistant'/);
    expect(appJs).toMatch(/copyMobileLinkButton\?\.addEventListener\('click'/);
  });

  test('the bot starter prompts and in-app guide expose the new capabilities', () => {
    expect(html).toMatch(/data-suggestion="\/predict"/);
    expect(html).toMatch(/data-suggestion="\/restock"/);
    expect(html).toMatch(/data-suggestion="\/anomalies"/);
    expect(appJs).toMatch(/Brouillon d’achat ou de vente/);
    expect(appJs).toMatch(/Prévisions et recommandations/);
    expect(appJs).toMatch(/Questions de suivi/);
  });
});
