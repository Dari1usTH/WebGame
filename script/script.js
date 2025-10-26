const q = document.getElementById('q');
const cards = [...document.getElementsByClassName('card')];

q?.addEventListener('input', () => {
      const val = q.value.toLowerCase().trim();
      cards.forEach(c => {
        const text = (c.innerText + ' ' + (c.dataset.tags||'')).toLowerCase();
        c.style.display = text.includes(val) ? '' : 'none';
      });
});