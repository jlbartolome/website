import { localUrl } from '../src/lib/urls.ts';

/** Preserve scientific typography and portable local URLs in Markdown bodies. */
export function contentMarkdown(base) {
  return {
    name: 'website-content',
    element: {
      filter: ['a', 'img', 'em'],
      visit(node, context) {
        if (node.tagName === 'img') {
          // Content images fit the existing prose column without changing the
          // separately rendered portrait, research icons, logo or hero artwork.
          context.setProperty(node, 'style', `${node.properties?.style || ''};max-width:100%;height:auto`);
        }
        for (const key of ['href', 'src']) {
          const value = node.properties?.[key];
          if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
            context.setProperty(node, key, localUrl(value, base));
          }
        }
        if (node.tagName === 'em' && /^ab\s+initio$/i.test(context.textContent(node))) {
          context.replaceNode(node, { type: 'element', tagName: 'i', properties: { lang: 'la' }, children: [{ type: 'text', value: context.textContent(node) }] });
        }
      },
    },
    text(node, context) {
      if (!/\bab\s+initio\b/i.test(node.value)) return;
      for (let parent = context.parent(node); parent; parent = context.parent(parent)) {
        if (['i', 'em', 'code', 'pre', 'script', 'style'].includes(parent.tagName)) return;
      }
      context.replaceNode(node, node.value.split(/(\bab\s+initio\b)/gi).filter(Boolean).map((value) =>
        /^ab\s+initio$/i.test(value)
          ? { type: 'element', tagName: 'i', properties: { lang: 'la' }, children: [{ type: 'text', value }] }
          : { type: 'text', value },
      ));
    },
  };
}
