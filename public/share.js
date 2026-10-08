// Share functionality for Business de Sidi

function shareViaEmail(transactions) {
  const totalSpent = transactions
    .filter(t => t.type === 'achat')
    .reduce((acc, t) => acc + t.total, 0);
  
  const totalEarned = transactions
    .filter(t => t.type === 'vente')
    .reduce((acc, t) => acc + t.total, 0);
  
  const profit = totalEarned - totalSpent;
  
  const subject = encodeURIComponent('Rapport Business de Sidi');
  const body = encodeURIComponent(
    `Rapport d'activité - Business de Sidi\n\n` +
    `Total dépensé: ${totalSpent.toFixed(2)}\n` +
    `Total gagné: ${totalEarned.toFixed(2)}\n` +
    `Bénéfice: ${profit.toFixed(2)}\n\n` +
    `Nombre de transactions: ${transactions.length}\n\n` +
    `Généré le ${new Date().toLocaleDateString('fr-FR')}`
  );
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function shareViaWhatsApp(transactions) {
  const totalSpent = transactions
    .filter(t => t.type === 'achat')
    .reduce((acc, t) => acc + t.total, 0);
  
  const totalEarned = transactions
    .filter(t => t.type === 'vente')
    .reduce((acc, t) => acc + t.total, 0);
  
  const profit = totalEarned - totalSpent;
  
  const text = encodeURIComponent(
    `📊 Rapport Business de Sidi\n\n` +
    `💰 Total dépensé: ${totalSpent.toFixed(2)}\n` +
    `💵 Total gagné: ${totalEarned.toFixed(2)}\n` +
    `📈 Bénéfice: ${profit.toFixed(2)}\n\n` +
    `📝 Transactions: ${transactions.length}\n\n` +
    `📅 ${new Date().toLocaleDateString('fr-FR')}`
  );
  
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareTransaction(transaction) {
  if (navigator.share) {
    navigator.share({
      title: 'Business de Sidi',
      text: `${transaction.type.toUpperCase()} - ${transaction.resource}\n` +
            `Quantité: ${transaction.quantity}\n` +
            `Total: ${transaction.total.toFixed(2)}\n` +
            `Date: ${new Date(transaction.date).toLocaleDateString('fr-FR')}`
    }).catch(console.error);
  } else {
    // Fallback to clipboard
    const text = `${transaction.type.toUpperCase()} - ${transaction.resource}\n` +
                 `Quantité: ${transaction.quantity}\n` +
                 `Total: ${transaction.total.toFixed(2)}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Copié dans le presse-papier!');
    });
  }
}

// Export functions for use in app-enhanced.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { shareViaEmail, shareViaWhatsApp, shareTransaction };
}
