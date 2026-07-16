const HISTORY_KEY = "navigation_history"
const MAX_HISTORY_SIZE = 50

class NavigationHistory {
  constructor() {
    this.history = this.loadHistory()
    this.currentIndex = this.history.length - 1
  }

  loadHistory() {
    try {
      const stored = sessionStorage.getItem(HISTORY_KEY)
      if (!stored) return []

      const data = JSON.parse(stored)
      return Array.isArray(data) ? data : []
    } catch (e) {
      console.error("Erro ao carregar histórico:", e)
      return []
    }
  }

  saveHistory() {
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(this.history))
    } catch (e) {
      console.error("Erro ao salvar histórico:", e)
    }
  }

  addPage(url, title) {
    const newEntry = {
      location: url,
      title: title,
      timestamp: Date.now()
    }

    // Se a página atual é a mesma, não adiciona
    if (this.history.length > 0) {
      const lastEntry = this.history[this.history.length - 1]
      if (lastEntry.location === url) {
        return
      }
    }

    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    this.history.push(newEntry)
    this.currentIndex = this.history.length - 1

    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history.shift()
      this.currentIndex--
    }

    this.saveHistory()
  }

  canGoBack() {
    return this.currentIndex > 0
  }

  goBack() {
    if (this.canGoBack()) {
      this.history.pop()
      this.currentIndex = this.history.length - 1
      this.saveHistory()
      return this.history[this.currentIndex]
    }
    return null
  }

  getPrevious() {
    if (this.canGoBack()) {
      return this.history[this.currentIndex - 1]
    }
    return null
  }

  getCurrentIndex() {
    return this.currentIndex
  }

  getHistorySize() {
    return this.history.length
  }

  clear() {
    this.history = []
    this.currentIndex = -1
    sessionStorage.removeItem(HISTORY_KEY)
  }

  // Debug: mostra todo o histórico
  printHistory() {
    console.log("=== Histórico de Navegação ===")
    this.history.forEach((entry, index) => {
      const marker = index === this.currentIndex ? "→" : " "
      console.log(`${marker} [${index}] ${entry.title} (${entry.location})`)
    })
    console.log(`Total: ${this.history.length} páginas`)
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const navHistory = new NavigationHistory()

  const currentPageTitleEl = document.querySelector(".md-content h1")
  const currentPageTitle = currentPageTitleEl
    ? currentPageTitleEl.innerText
    : document.title

  navHistory.addPage(window.location.href, currentPageTitle)
})

document.addEventListener("DOMContentLoaded", function () {
  const backLinkElement = document.querySelector("#back-to-previous")

  if (!backLinkElement) {
    console.warn("Elemento #back-to-previous não encontrado.")
    return
  }

  const backLinkTextElement = backLinkElement.querySelector("span")
  const navHistory = new NavigationHistory()
  const previousPage = navHistory.getPrevious()

  if (!previousPage || !navHistory.canGoBack()) {
    backLinkElement.style.display = "none"
    return
  }

  backLinkElement.href = previousPage.location

  if (backLinkTextElement) {
    backLinkTextElement.textContent = `Voltar para "${previousPage.title}"`
  }

  backLinkElement.style.display = "flex"

  backLinkElement.addEventListener("click", function (e) {
    e.preventDefault()
    navHistory.goBack()
    window.location.href = previousPage.location
  })
})

window.NavigationHistory = NavigationHistory
