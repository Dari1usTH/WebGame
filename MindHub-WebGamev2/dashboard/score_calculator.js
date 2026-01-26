const totalScoreElement = document.querySelector('.total-score')

if (totalScoreElement) {
  const games = [
    'word9', 'wordle10', 'stop11', 'shape3', 'sequence2', 'path5',
    'numbers1', 'math12', 'match6', 'map14', 'intr4', 'green13',
    'countit8', 'catchit7'
  ]

  const total = games.reduce((sum, game) => {
    const value = parseInt(localStorage.getItem('score_' + game), 10)
    return sum + (Number.isFinite(value) ? value : 0)
  }, 0)

  totalScoreElement.textContent = total
}