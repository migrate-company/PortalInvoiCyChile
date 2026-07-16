(function () {
  'use strict';

  function isInsideNav(link) {
    // Retorna true se o link estiver dentro do menu lateral / nav do tema
    return !!link.closest('.md-nav, .md-sidebar, nav, .md-header, .md-nav__list, .md-nav__item, .md-nav__link');
  }

  function processLinks(root = document) {
    // Seleciona links dentro do conteúdo do artigo/main que AINDA NÃO têm target
    const selector = 'article a[href]:not([target]), main a[href]:not([target]), .md-content a[href]:not([target])';
    const links = Array.from(root.querySelectorAll(selector));
    let changed = 0;
    
    // Captura o hostname atual para comparação
    const currentHostname = window.location.hostname; 

    links.forEach(link => {
      const href = link.getAttribute('href') || '';

      // Ignora: vazios, âncoras internas (#), e protocolos especiais (mailto, tel, javascript)
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
        return;
      }

      // Ignora: links que fazem parte do menu / navegação
      if (isInsideNav(link)) return;

      // Verifica se o link é externo
      try {
        // Cria um objeto URL (usa a URL da página atual como base para resolver caminhos relativos)
        const linkUrl = new URL(href, window.location.href);

        // Se o hostname do link for igual ao hostname da página atual, o link é interno. Ignorar.
        if (linkUrl.hostname === currentHostname) {
          return;
        }

      } catch (e) {
        // Se a construção da URL falhar (ex: URL mal formada), ignoramos o link para evitar erros.
        return;
      }

      // Define para abrir em nova aba, pois passou por todos os filtros e é externo
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      changed++;
    });

    // Debug: ver quantos links foram alterados
    if (changed > 0) {
      console.debug(`open_external_links_new_tab: ${changed} links externos atualizados para target="_blank"`);
    }
  }

  // Primeira aplicação na carga inicial
  document.addEventListener('DOMContentLoaded', () => processLinks());

  // Se o Material expor document$ (instant loading), inscreve para reaplicar após cada navegação
  try {
    if (window.document$ && typeof window.document$.subscribe === 'function') {
      document$.subscribe(() => {
        // espera microtask para garantir que o conteúdo foi injetado
        setTimeout(() => processLinks(), 0);
      });
    }
  } catch (e) {
    console.warn('open_external_links_new_tab: document$ subscribe failed', e);
  }

  // Fallback robusto: observa mudanças no main (útil se o observable não existir)
  const main = document.querySelector('main') || document.body;
  const observer = new MutationObserver((mutations) => {
    // pequeno debounce para evitar execuções excessivas
    if (observer._timeout) clearTimeout(observer._timeout);
    observer._timeout = setTimeout(() => {
      processLinks(main);
    }, 50);
  });
  observer.observe(main, { childList: true, subtree: true });

})();