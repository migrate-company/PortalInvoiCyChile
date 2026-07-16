class DedicatedSearch {
  #searchInput
  #toggleSearch
  #resultsContainer

  #pageData = []
  #flexIndex = null
  #indexLoaded = false
  #indexPath = "/PortalDesenvolvedoresBrasil/search/search_index.json"

  constructor(elements) {
    this.#searchInput = document.getElementById(elements.searchInputId)
    this.#toggleSearch = document.querySelector(elements.toggleSearchSelector)
    this.#resultsContainer = document.getElementById(
      elements.resultsContainerId
    )

    if (this.#searchInput && this.#resultsContainer) {
      this.#init()
    } else {
      console.error(
        "Um ou mais elementos de busca não foram encontrados no DOM."
      )
    }
  }

  #init() {
    this.#loadIndex()
      .then(() => {
        this.#handleInitialSearch()
        this.#toggleSearch.checked = false
        this.#searchInput.blur()
        this.#setupEventListeners()
      })
      .catch((error) => {
        this.#displayLoadError(error)
      })
  }

  #setupEventListeners() {
    window.addEventListener("searchUrlUpdated", () =>
      this.#handleInitialSearch()
    )
  }

  async #loadIndex() {
    try {
      this.#resultsContainer.innerHTML = "<p>Carregando índice de busca...</p>"

      const response = await fetch(this.#indexPath)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()

      this.#pageData = data.docs
      this.#flexIndex = this.#buildFlexIndex(data.docs, data.config)
      this.#indexLoaded = true
    } catch (error) {
      throw error
    }
  }

  #buildFlexIndex(docs, config) {
    const fieldsConfig = config.fields || {}

    const fields = Object.keys(fieldsConfig).map((fieldName) => ({
      field: fieldName,
      store: false
    }))

    const index = new FlexSearch.Document({
      document: {
        id: "location",
        tag: "tags",
        store: ["title", "text", "location"],
        index: fields.map((f) => f.field),
        index: Object.keys(fieldsConfig).map((fieldName) => ({
          field: fieldName
        }))
      }
    })
    docs.forEach((doc) => {
      const sanitizedDoc = {
        location: doc.location || "",
        title: doc.title || "",
        text: doc.text || "",
        tags: doc.tags || []
      }

      index.add(sanitizedDoc)
    })

    return index
  }

  #handleInitialSearch() {
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get("q")

    if (query) {
      this.#searchInput.value = query
      this.#performSearch(query)
    } else {
      this.#resultsContainer.innerHTML =
        "<p>Digite um termo e pressione <strong>Enter</strong> para iniciar a busca.</p>"
    }
  }

  #performSearch(query) {
    if (!this.#indexLoaded) {
      this.#resultsContainer.innerHTML =
        "<p>Índice de busca ainda não carregado. Tente novamente em um instante.</p>"
      return
    }

    try {
      const rawResults = this.#flexIndex.search(query, {
        limit: 100,
        suggest: true,
        depth: 2
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
            hits: [ref]
          })
        } else {
          groupedResults.get(baseUrl).hits.push(ref)
        }
      })

      const finalResults = Array.from(groupedResults.values())

      this.#displayResults(finalResults, query)
    } catch (e) {
      this.#resultsContainer.innerHTML = `<p>Ocorreu um erro ao executar a busca para "<strong>${query}</strong>".</p>`
      console.error("Erro FlexSearch:", e)
    }
  }

  #displayResults(results, query) {
    if (results.length === 0) {
      this.#resultsContainer.innerHTML = `<p>Nenhum resultado encontrado para "<strong>${query}</strong>".</p>`
      return
    }

    // A contagem total agora é o tamanho do array de resultados únicos (páginas)
    let html = `<p>Encontradas <strong>${results.length}</strong> páginas para "${query}"</p>`

    results.forEach((result) => {
      const ref = result.ref
      const hitCount = result.hits.length

      const doc = this.#pageData.find((d) => d.location.startsWith(ref))

      if (doc) {
        const snippet = this.#getFirstParagraphContent(doc.text) + "..."

        const absoluteUrl = new URL(
          `/PortalDesenvolvedoresBrasil/${ref}`,
          window.location.origin
        )

        // 🚨 NOVO: Texto adicional para a contagem
        const hitText = hitCount > 1 ? ` (${hitCount} mais nesta página)` : ""

        html += `
            <a href="${absoluteUrl.toString()}?highlight=${encodeURIComponent(
          query
        )}" class="search-result__item">
              <h3>${doc.title} <span>${hitText}</span></h3>
              <p>${snippet}</p>
              <span>${ref}</span>
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
    this.#resultsContainer.innerHTML = `<p>⚠️ **Erro ao carregar a busca**. Verifique se o plugin de busca está configurado e se o arquivo <mark>search_index.json</mark> está acessível. (${error.message})</p>`
    console.error("Erro ao carregar o índice de busca:", error)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new DedicatedSearch({
    toggleSearchSelector: 'input[type="checkbox"][data-md-toggle="search"]',
    searchInputId: "__search-input",
    searchButtonId: "search-button",
    resultsContainerId: "search-result-container",
    searchTitleId: "search-title"
  })
})
