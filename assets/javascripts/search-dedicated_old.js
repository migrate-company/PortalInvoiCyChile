class DedicatedSearch {
  #searchInput
  #toggleSearch
  #resultsContainer

  #pageData = []
  #lunrIndex = null
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
      this.#lunrIndex = this.#buildLunrIndex(data.docs, data.config)
      this.#indexLoaded = true
    } catch (error) {
      throw error
    }
  }

  #buildLunrIndex(docs, config) {
    return lunr(function () {
      if (config.lang && config.lang.includes("pt") && lunr.pt) {
        this.use(lunr.pt)
      }

      for (const fieldName in config.fields) {
        const fieldConfig = config.fields[fieldName]

        if (fieldConfig.boost) {
          this.field(fieldName, { boost: fieldConfig.boost })
        } else {
          this.field(fieldName)
        }
      }

      this.ref("location")

      docs.forEach(function (doc) {
        this.add(doc)
      }, this)
    })
  }

  #handleInitialSearch() {
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get("q")

    if (query) {
      this.#searchInput.value = query
      this.#performSearch(query)
    } else {
      this.#resultsContainer.innerHTML =
        "<p>Digite um termo e pressione **Enter** para iniciar a busca.</p>"
    }
  }

  #performSearch(query) {
    if (!this.#indexLoaded) {
      this.#resultsContainer.innerHTML =
        "<p>Índice de busca ainda não carregado. Tente novamente em um instante.</p>"
      return
    }

    try {
      const logicalQuery = query
        .split(" ")
        .map((term) => `+${term}`)
        .join(" ")

      console.log(logicalQuery)
      const results = this.#lunrIndex.search(logicalQuery)
      this.#displayResults(results, query)
    } catch (e) {
      this.#resultsContainer.innerHTML = `<p>Ocorreu um erro ao executar a busca para "<strong>${query}</strong>".</p>`
      console.error("Erro Lunr.js:", e)
    }
  }

  #getFirstParagraphContent(htmlString) {
    if (!htmlString) return "Sem descrição."

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlString, "text/html")
      const firstParagraph = doc.querySelector("p")

      if (firstParagraph) {
        return this.#truncateContent(firstParagraph.textContent, 200)
      }

      const firstBlockElement = doc.body.firstElementChild

      if (firstBlockElement) {
        return this.#truncateContent(firstBlockElement.textContent, 200)
      }

      const plainText = htmlString.replace(/<[^>]*>/g, "").trim()
      return this.#truncateContent(plainText, 200)
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

  #displayResults(results, query) {
    console.log(results)

    if (results.length === 0) {
      this.#resultsContainer.innerHTML = `<p>Nenhum resultado encontrado para "<strong>${query}</strong>".</p>`
      return
    }

    let html = `<p>Encontrados <strong>${results.length}</strong> resultados para "${query}"</p>`

    results.forEach((result) => {
      const doc = this.#pageData.find((d) => d.location === result.ref)

      console.log(doc)

      if (doc) {
        const snippet = this.#getFirstParagraphContent(doc.text) + "..."

        console.log("Snippet:", snippet)

        const absoluteUrl = new URL(
          `/PortalDesenvolvedoresBrasil/${doc.location}`,
          window.location.origin
        )

        html += `
            <a href="${absoluteUrl.toString()}" class="search-result__item">
              <h3>${doc.title}</h3>
              <p>${snippet}</p>
              <span>${doc.location}</span>
            </a>
          `
      }
    })

    this.#resultsContainer.innerHTML = html
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
