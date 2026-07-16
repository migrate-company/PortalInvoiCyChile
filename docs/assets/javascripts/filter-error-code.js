class TableFilterWithURL {
  #form
  #table
  #tableFooterCol
  #resultsCountSpan
  #searchInput
  #checkboxes
  #rows
  #debounceDelay = 300
  #debounceTimer = null

  constructor(tableId, formId) {
    this.#form = document.getElementById(formId)
    this.#table = document.getElementById(tableId)

    if (!this.#form || !this.#table) {
      console.error(
        "Um dos elementos principais (Tabela ou Formulário) não foi encontrado."
      )
      return
    }

    this.#tableFooterCol = this.#table.tFoot?.querySelector("td")
    this.#resultsCountSpan = document.querySelector(".results-count strong")
    this.#searchInput = this.#form.elements.searchInput
    this.#checkboxes = this.#form.elements.module
      ? Array.from(this.#form.elements.module)
      : []
    this.#rows = this.#table.querySelectorAll("tbody tr")

    this.#init()
  }

  #init() {
    this.loadStateFromURL()

    this.#form.addEventListener("submit", (ev) => ev.preventDefault())
    this.#searchInput.addEventListener("input", () => this.#debounceFilter())

    this.#checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => this.applyFiltersAndUpdateURL())
    })

    window.addEventListener("popstate", () => this.loadStateFromURL())
  }

  #debounceFilter() {
    clearTimeout(this.#debounceTimer)
    this.#debounceTimer = setTimeout(() => {
      this.applyFiltersAndUpdateURL()
    }, this.#debounceDelay)
  }

  loadStateFromURL() {
    const params = new URLSearchParams(window.location.search)

    const search = params.get("search") ?? ""
    this.#searchInput.value = search

    const modules = params.get("modules")

    const modulesArray = modules ? modules.split(",") : []

    this.#checkboxes.forEach((cb) => {
      cb.checked = modulesArray.includes(cb.value)
    })

    this.filter()
  }

  updateURL() {
    const params = new URLSearchParams()

    const search = this.#searchInput.value.trim()
    if (search) {
      params.set("search", search)
    }

    const selectedModules = this.getSelectedModules()
    if (selectedModules.length > 0) {
      params.set("modules", selectedModules.join(","))
    }

    const newURL = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname

    window.history.pushState({}, "", newURL)
  }

  getSelectedModules() {
    return this.#checkboxes.filter((cb) => cb.checked).map((cb) => cb.value)
  }

  applyFiltersAndUpdateURL() {
    this.filter()
    this.updateURL()
  }

  filter() {
    const selectedModules = this.getSelectedModules()
    const term = this.#searchInput.value.toLowerCase().trim()
    let visibleRows = []

    this.#table.tFoot.style.display = "none"

    this.#rows.forEach((row) => {
      const { cells } = row

      const module = cells[0].textContent.trim()
      const code = cells[1].textContent.trim()
      const message = cells[2].textContent.trim().toLowerCase()

      const moduleOk =
        selectedModules.length === 0 || selectedModules.includes(module)

      const searchOk =
        term === "" ||
        code.toLowerCase().includes(term) ||
        message.includes(term)

      if (moduleOk && searchOk) {
        visibleRows.push(row)
      } else {
        row.classList.remove("fade-in")
        row.style.display = "none"
      }
    })

    this.#updateFooter(visibleRows.length)
    this.#updateCounter(visibleRows.length)
    this.#animateRows(visibleRows)
  }

  #updateFooter(count) {
    if (count === 0) {
      if (this.#tableFooterCol) {
        this.#tableFooterCol.innerText = "Nenhum resultado encontrado"
        this.#table.tFoot.style.display = "table-footer-group"
      }
    } else {
      this.#table.tBodies[0].style.display = "table-row-group"
    }
  }

  #updateCounter(visibleCount) {
    this.#resultsCountSpan.textContent = visibleCount
  }

  #animateRows(rows) {
    const animationStartDelay = 10
    const sequenceDelay = 10

    rows.forEach((row, index) => {
      row.classList.remove("fade-in")
      row.style.display = "none"
      row.style.opacity = "0"

      setTimeout(() => {
        row.style.display = ""
        void row.offsetWidth

        row.classList.add("fade-in")
        row.style.animationDelay = `${index * sequenceDelay}ms`
        row.style.opacity = ""
      }, animationStartDelay)
    })
  }

  clearFilters() {
    this.#searchInput.value = ""
    this.#checkboxes.forEach((cb) => (cb.checked = false))
    this.applyFiltersAndUpdateURL()
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TableFilterWithURL("codesTable", "form-filter-error-codes")
})
