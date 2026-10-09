(function () {
    'use strict';

    function text(element) {
        return element ? element.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function trackClick(event) {
        if (event.type === 'auxclick' ? event.button !== 1 : event.button !== 0) return;
        if (!window.goatcounter || typeof window.goatcounter.count !== 'function') return;
        if (!event.target.closest) return;

        var element = event.target.closest('a[href], button.abstract-toggle');
        if (!element) return;

        var path;
        var label;
        if (element.matches('button.abstract-toggle')) {
            // The toggle's own handler has already updated aria-expanded.
            if (event.type !== 'click' || element.getAttribute('aria-expanded') !== 'true') return;
            path = 'abstract:' + element.getAttribute('aria-controls');
            label = 'Open abstract';
        } else {
            var href = element.getAttribute('href').trim();
            if (!href || href === '#') return;

            var destination;
            try { destination = new URL(href, document.baseURI); }
            catch (error) { return; }
            if (destination.protocol !== 'http:' && destination.protocol !== 'https:') return;

            // Keep meaningful fragments and queries (tabs, YouTube video IDs, etc.).
            var target = (destination.origin === window.location.origin ? '' : destination.host) +
                destination.pathname + destination.search + destination.hash;
            path = 'click:' + target;
            var image = element.querySelector('img[alt]');
            label = text(element) || element.getAttribute('title') ||
                (image && image.getAttribute('alt')) || target;
        }

        // Distinguish generic labels such as "arXiv version" by paper title.
        var item = element.closest('li');
        var paperTitle = item && item.querySelector('b');
        if (paperTitle && !paperTitle.contains(element)) label += ' — ' + text(paperTitle);

        try {
            window.goatcounter.count({
                path: path,
                title: label,
                referrer: window.location.pathname,
                event: true,
                no_session: true
            });
        } catch (error) {
            // Analytics must never interfere with navigation or abstract toggles.
        }
    }

    document.addEventListener('click', trackClick);
    document.addEventListener('auxclick', trackClick);
})();
