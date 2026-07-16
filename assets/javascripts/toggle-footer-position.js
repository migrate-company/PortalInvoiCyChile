const SCROLL_WRAPPER_SELECTOR = ".md-sidebar__scrollwrap"
const FOOTER_SELECTOR = ".md-footer"

function hasVerticalScroll(element) {
  return element.scrollHeight > element.clientHeight
}

function toggleFooterPosition() {
  const scrollElement = document.querySelector(SCROLL_WRAPPER_SELECTOR)
  const fixedFooter = document.querySelector(FOOTER_SELECTOR)

  if (!scrollElement || !fixedFooter) {
    console.warn(`Elementos não encontrados. Verifique os seletores.`)
    return
  }

  const scrollVisible = hasVerticalScroll(scrollElement)

  if (scrollVisible) {
    fixedFooter.style.position = "static"
  } else {
    fixedFooter.style.position = "fixed"
  }
}

document.addEventListener("DOMContentLoaded", () => {
  toggleFooterPosition()
})

window.addEventListener("resize", toggleFooterPosition)

const scrollElement = document.querySelector(SCROLL_WRAPPER_SELECTOR)

if (scrollElement && typeof ResizeObserver !== "undefined") {
  const observer = new ResizeObserver(() => {
    toggleFooterPosition()
  })

  observer.observe(scrollElement)

  const contentObserver = new MutationObserver(toggleFooterPosition)
  contentObserver.observe(scrollElement, {
    childList: true,
    subtree: true,
    attributes: true
  })
}
