// document.addEventListener("DOMContentLoaded", function () {
//   const body = document.body

//   // coleta itens numerados (ol > li e fallback em <p> "1. ...")
//   const allItems = []
//   document.querySelectorAll("ol").forEach((ol) => {
//     const lis = ol.querySelectorAll("li")
//     if (lis.length) {
//       lis.forEach((li) => allItems.push(li.innerHTML.trim()))
//       //ol.style.display = 'none';
//     }
//   })
//   const pItems = []
//   document.querySelectorAll("p").forEach((p) => {
//     const txt = (p.textContent || "").trim()
//     const m = txt.match(/^(\d+)\.\s*(.*)$/)
//     if (m) {
//       pItems.push(m[2])
//       p.style.display = "none"
//     }
//   })
//   if (pItems.length) allItems.push(...pItems)

//   document.querySelectorAll("pre > code").forEach(function (code) {
//     const raw = code.innerHTML
//     const markerRegex = /&lt;!--\s*\((\d+)\)\s*--&gt;|<!--\s*\((\d+)\)\s*-->/g
//     let matches = []
//     let replaced = false

//     const newHtml = raw.replace(markerRegex, function (_, g1, g2) {
//       const n = g1 || g2
//       matches.push(n)
//       replaced = true
//       return `<span class="code-annot-marker" data-annot="${n}" tabindex="0" aria-label="anotação ${n}">◉</span>`
//     })

//     if (!replaced) return
//     code.innerHTML = newHtml

//     matches.forEach(function (num, index) {
//       const marker = code.querySelector(
//         `.code-annot-marker[data-annot="${num}"]`
//       )
//       if (!marker) return
//       const content = allItems[Number(num) - 1] || allItems[index] || ""

//       // cria o tip e anexa ao body (para evitar clipping por overflow)
//       const tip = document.createElement("div")
//       tip.className = "code-annot-tip"
//       tip.innerHTML = `<div class="code-annot-tip-inner">${content}</div>`
//       tip.style.position = "absolute"
//       tip.style.display = "none"
//       tip.style.zIndex = 9999
//       body.appendChild(tip)

//       let hideTimeout = null
//       tip.pinned = false

//       function cancelHide() {
//         if (hideTimeout) {
//           clearTimeout(hideTimeout)
//           hideTimeout = null
//         }
//       }
//       function scheduleHide() {
//         if (tip.pinned) return
//         cancelHide()
//         hideTimeout = setTimeout(hideTip, 150)
//       }
//       function showTip() {
//         cancelHide()
//         // posiciona temporariamente para medir
//         tip.style.display = "block"
//         tip.style.visibility = "hidden"
//         const rect = marker.getBoundingClientRect()
//         const leftTent = rect.left + window.pageXOffset
//         let topTent = rect.bottom + window.pageYOffset + 8
//         tip.style.left = leftTent + "px"
//         tip.style.top = topTent + "px"

//         // mede e corrige overflow
//         const tRect = tip.getBoundingClientRect()
//         let newLeft = leftTent
//         let newTop = topTent
//         if (tRect.right > window.innerWidth - 8) {
//           newLeft = window.pageXOffset + (window.innerWidth - tRect.width - 8)
//         }
//         if (newLeft < 8 + window.pageXOffset) newLeft = 8 + window.pageXOffset
//         if (tRect.bottom > window.innerHeight - 8) {
//           newTop = rect.top + window.pageYOffset - tRect.height - 8
//           if (newTop < 8 + window.pageYOffset) newTop = topTent
//         }
//         tip.style.left = newLeft + "px"
//         tip.style.top = newTop + "px"
//         tip.style.visibility = ""
//         tip.classList.add("visible")
//       }
//       function hideTip() {
//         cancelHide()
//         tip.classList.remove("visible")
//         tip.style.display = "none"
//         tip.pinned = false
//         tip.classList.remove("pinned")
//       }

//       // eventos para hover/focus com tolerância para entrar no tip
//       marker.addEventListener("mouseenter", showTip)
//       marker.addEventListener("focus", showTip)
//       marker.addEventListener("mouseleave", scheduleHide)
//       tip.addEventListener("mouseenter", cancelHide)
//       tip.addEventListener("mouseleave", scheduleHide)

//       // clique alterna "pinned"
//       marker.addEventListener("click", function (e) {
//         e.stopPropagation()
//         // despin todos os outros tips
//         document
//           .querySelectorAll(".code-annot-tip.pinned")
//           .forEach(function (other) {
//             if (other !== tip) {
//               other.classList.remove("pinned")
//               other.pinned = false
//               other.style.display = "none"
//               other.classList.remove("visible")
//             }
//           })

//         if (tip.pinned) {
//           tip.pinned = false
//           tip.classList.remove("pinned")
//           hideTip()
//         } else {
//           tip.pinned = true
//           tip.classList.add("pinned")
//           showTip()
//         }
//       })

//       // clicar fora fecha apenas não-pinned; pinned só fecha com ESC ou clicando de novo no ícone
//       document.addEventListener("click", function (e) {
//         if (!marker.contains(e.target) && !tip.contains(e.target)) {
//           if (!tip.pinned) hideTip()
//         }
//       })

//       // ESC fecha pinned
//       document.addEventListener("keydown", function (e) {
//         if (e.key === "Escape" || e.key === "Esc") {
//           if (tip.pinned) {
//             tip.pinned = false
//             tip.classList.remove("pinned")
//             hideTip()
//           }
//         }
//       })

//       // reposiciona se necessário durante scroll/resize
//       window.addEventListener(
//         "scroll",
//         function () {
//           if (tip.classList.contains("visible")) showTip()
//         },
//         { passive: true }
//       )
//       window.addEventListener("resize", function () {
//         if (tip.classList.contains("visible")) showTip()
//       })
//     })
//   })
// })
