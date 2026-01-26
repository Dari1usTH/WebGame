let user = localStorage.getItem("user")

if (!user) {
  localStorage.setItem("user", "guest")
}

document.addEventListener('DOMContentLoaded', function() {
  let scoreElements = document.querySelectorAll('.game-score')
  
  scoreElements.forEach(function(element) {
    let gameName = element.getAttribute('data-game')
    let score = localStorage.getItem('score_' + gameName)
    
    if (score) {
      element.textContent = score
    }
  })
})