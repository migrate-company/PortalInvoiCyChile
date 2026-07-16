class DedicatedSearch {
  #searchInput
  #toggleSearch
  #resultsContainer
  #resultsCount
  #modalOverlay
  #modal

  #pageData = []
  #flexIndex = null
  #indexLoaded = false
  #indexPath = "/search/search_index.json"

  // Variáveis para controle do drag
  #isDragging = false
  #startY = 0
  #currentY = 0
  #dragThreshold = 100 // Pixels necessários para fechar

  #mobileBreakpoint = 834
  #siteBaseUrl = null

  constructor(elements) {
    this.#searchInput = document.getElementById(elements.searchInputId)
    this.#resultsContainer = document.getElementById(
      elements.resultsContainerId,
    )
    this.#resultsCount = document.getElementById(elements.resultsCountId)
    this.#modalOverlay = document.getElementById(elements.modalOverlayId)
    this.#toggleSearch = document.getElementById(elements.toggleSearchId)
    this.#modal = document.getElementById(elements.modalId)

    if (this.#searchInput && this.#resultsContainer) {
      this.#init()
    } else {
      console.error(
        "Um ou mais elementos de busca não foram encontrados no DOM.",
      )
    }
  }

  #init() {
    this.#siteBaseUrl = this.#getSiteBaseUrl()
    this.#indexPath = new URL(
      "search/search_index.json",
      this.#siteBaseUrl,
    ).toString()
    this.#setupEventListeners()
    this.#loadIndex()
      .then(() => {
        console.log("Índice carregado com sucesso")
      })
      .catch((error) => {
        this.#displayLoadError(error)
      })
  }

  #setupEventListeners() {
    this.#toggleSearch.addEventListener("click", () => this.#openModal())

    this.#modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.#modalOverlay) {
        this.#closeModal()
      }
    })

    this.#searchInput.addEventListener("input", (e) => {
      this.#performSearch(e.target.value)
    })

    this.#searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && this.#isMobile()) {
        this.#searchInput.blur()
      }
    })

    // Atalhos de teclado
    document.addEventListener("keydown", (e) => {
      // Cmd/Ctrl + K para abrir
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        this.#openModal()
      }

      // Esc para fechar
      if (e.key === "Escape") {
        this.#closeModal()
      }
    })

    // Eventos de drag para mobile
    this.#setupDragEvents()
  }

  #setupDragEvents() {
    const dragHandle = this.#modal

    dragHandle.addEventListener("touchstart", (e) => this.#handleDragStart(e), {
      passive: false,
    })
    document.addEventListener("touchmove", (e) => this.#handleDragMove(e), {
      passive: false,
    })
    document.addEventListener("touchend", (e) => this.#handleDragEnd(e))

    dragHandle.addEventListener("mousedown", (e) => this.#handleDragStart(e))
    document.addEventListener("mousemove", (e) => this.#handleDragMove(e))
    document.addEventListener("mouseup", (e) => this.#handleDragEnd(e))
  }

  #handleDragStart(e) {
    if (this.#isMobile() === false) {
      return
    }

    if (this.#resultsContainer.scrollTop > 0) {
      return
    }

    this.#isDragging = true
    this.#startY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY
    this.#currentY = this.#startY

    this.#modal.style.transition = "none"
  }

  #handleDragMove(e) {
    if (!this.#isDragging) return

    const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY
    this.#currentY = clientY

    const deltaY = this.#currentY - this.#startY

    if (deltaY > 0) {
      e.preventDefault()
      this.#modal.style.transform = `translateY(${deltaY}px)`
      const opacity = Math.max(0.5 - deltaY / 400, 0)
      this.#modalOverlay.style.background = `rgba(0, 0, 0, ${opacity})`
    }
  }

  #handleDragEnd() {
    if (!this.#isDragging) return

    this.#isDragging = false
    const deltaY = this.#currentY - this.#startY

    this.#modal.style.transition = "transform 0.3s ease, opacity 0.3s ease"

    if (deltaY > this.#dragThreshold) {
      this.#modal.style.transform = "translateY(100%)"
      this.#modal.style.opacity = "0"

      setTimeout(() => {
        this.#closeModal()
        this.#resetModalStyle()
      }, 300)
    } else {
      this.#modal.style.transform = "translateY(0)"
      this.#modalOverlay.style.background = "rgba(0, 0, 0, 0.5)"
    }
  }

  #resetModalStyle() {
    this.#modal.style.transition = ""
    this.#modal.style.transform = ""
    this.#modal.style.opacity = ""
    this.#modalOverlay.style.background = ""
  }

  #isMobile() {
    return document.body.clientWidth <= this.#mobileBreakpoint
  }

  #openModal() {
    this.#modalOverlay.classList.add("active")
    this.#searchInput.focus()
    this.#resetModalStyle()
  }

  #closeModal() {
    this.#modalOverlay.classList.remove("active")
    this.#searchInput.value = ""
    this.#resultsContainer.innerHTML =
      '<div class="empty-state">Escribe algo para empezar a buscar</div>'
    this.#resultsCount.textContent = ""
    this.#resetModalStyle()
  }

  #isArticleDoc(doc) {
    const loc = doc.location || ""
    const assetExtensions =
      /\.(css|js|png|svg|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|pdf|zip)(\?.*)?$/i
    return !assetExtensions.test(loc) && !loc.startsWith("assets/")
  }

  async #loadIndex() {
    try {
      this.#resultsContainer.innerHTML =
        '<div class="loading-state">Carregando índice de busca...</div>'

      const response = await fetch(this.#indexPath)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()

      const articleDocs = data.docs.filter((doc) => this.#isArticleDoc(doc))

      this.#pageData = articleDocs
      this.#flexIndex = this.#buildFlexIndex(articleDocs, data.config)
      this.#indexLoaded = true

      this.#resultsContainer.innerHTML =
        '<div class="empty-state">Escribe algo para empezar a buscar</div>'
    } catch (error) {
      throw error
    }
  }

  #buildFlexIndex(docs, config) {
    const fieldsConfig = config.fields || {}
    const configuredFields = Object.keys(fieldsConfig)
    const searchableFields =
      configuredFields.length > 0
        ? configuredFields
        : ["title", "text", "location"]

    const index = new FlexSearch.Document({
      document: {
        id: "location",
        tag: "tags",
        store: ["title", "text", "location"],
        index: searchableFields.map((fieldName) => ({
          field: fieldName,
        })),
      },
    })
    docs.forEach((doc) => {
      const sanitizedDoc = {
        location: doc.location || "",
        title: doc.title || "",
        text: doc.text || "",
        tags: doc.tags || [],
      }

      index.add(sanitizedDoc)
    })

    return index
  }

  #getSiteBaseUrl() {
    const currentScript = document.querySelector(
      'script[src*="assets/javascripts/search-dedicated.js"]',
    )

    if (currentScript?.src) {
      return new URL("../../", currentScript.src).toString()
    }

    return new URL("/", window.location.origin).toString()
  }

  #performSearch(query) {
    if (!query.trim()) {
      this.#resultsContainer.innerHTML =
        '<div class="empty-state">Escribe algo para empezar a buscar</div>'
      this.#resultsCount.textContent = ""
      return
    }

    if (!this.#indexLoaded) {
      this.#resultsContainer.innerHTML =
        '<div class="loading-state">Índice de busca ainda não carregado. Tente novamente em um instante.</div>'
      return
    }

    try {
      const rawResults = this.#flexIndex.search(query, {
        limit: 100,
        suggest: true,
        depth: 2,
      })

      const allRefs = []
      rawResults.forEach((fieldResult) => {
        fieldResult.result.forEach((ref) => allRefs.push(ref))
      })

      const groupedResults = new Map()

      allRefs.forEach((ref) => {
        const baseUrl = ref.split("#")[0]

        if (!groupedResults.has(baseUrl)) {
          groupedResults.set(baseUrl, {
            ref: baseUrl,
            hits: [ref],
          })
        } else {
          groupedResults.get(baseUrl).hits.push(ref)
        }
      })

      const finalResults = Array.from(groupedResults.values())

      this.#displayResults(finalResults, query)
    } catch (e) {
      this.#resultsContainer.innerHTML = `<div class="empty-state">Ocorreu um erro ao executar a busca para "<strong>${query}</strong>".</div>`
      console.error("Erro FlexSearch:", e)
    }
  }

  #displayResults(results, query) {
    if (results.length === 0) {
      this.#resultsContainer.innerHTML = `<div class="empty-state">Nenhum resultado encontrado para "<strong>${query}</strong>".</div>`
      this.#resultsCount.textContent = ""
      return
    }

    this.#resultsCount.textContent = `${results.length} resultado${
      results.length > 1 ? "s" : ""
    } encontrado${results.length > 1 ? "s" : ""}`

    let html = ""

    results.forEach((result) => {
      const ref = result.ref
      const hitCount = result.hits.length

      const doc = this.#pageData.find((d) => d.location.startsWith(ref))

      if (doc) {
        const snippet = this.#getFirstParagraphContent(doc.text)

        const absoluteUrl = new URL(ref, this.#siteBaseUrl)

        const hitText =
          hitCount > 1
            ? `<span class="result-hit-count">(${hitCount} ocorrências)</span>`
            : ""

        html += `
                  <a href="${absoluteUrl.toString()}?highlight=${encodeURIComponent(
                    query,
                  )}" class="result-item">
                      <div class="result-title">
                          <svg class="result-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>${doc.title} ${hitText}</span>
                      </div>
                      <div class="result-description">${snippet}</div>
                      <div class="result-location">${ref}</div>
                  </a>
              `
      }
    })

    this.#resultsContainer.innerHTML = html
  }

  #getFirstParagraphContent(htmlString) {
    if (!htmlString) return "Sem descrição."

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlString, "text/html")
      let contentToTruncate = ""

      const firstParagraph = doc.querySelector("p")
      if (firstParagraph) {
        contentToTruncate = firstParagraph.textContent
      } else {
        const firstBlockElement = doc.body.firstElementChild
        if (firstBlockElement) {
          contentToTruncate = firstBlockElement.textContent
        } else {
          contentToTruncate = htmlString.replace(/<[^>]*>/g, "").trim()
        }
      }
      return this.#truncateContent(contentToTruncate, 200)
    } catch (e) {
      console.error("Erro ao analisar HTML para snippet:", e)
      return "Erro ao extrair descrição."
    }
  }

  #truncateContent(text, maxLength) {
    if (text.length <= maxLength) {
      return text
    }

    return text.substring(0, maxLength).trim() + "..."
  }

  #displayLoadError(error) {
    this.#resultsContainer.innerHTML = `<div class="empty-state">⚠️ Erro ao carregar a busca. Verifique se o plugin de busca está configurado e se o arquivo search_index.json está acessível. (${error.message})</div>`
    console.error("Erro ao carregar o índice de busca:", error)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new DedicatedSearch({
    toggleSearchId: "searchButton",
    searchInputId: "searchInput",
    resultsContainerId: "results",
    resultsCountId: "resultsCount",
    modalOverlayId: "modalOverlay",
    modalId: "modal",
  })
})
