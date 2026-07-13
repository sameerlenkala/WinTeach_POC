import DOMPurify from 'dompurify';

/**
 * Sanitize SVG markup before it is injected via dangerouslySetInnerHTML.
 *
 * Our diagrams are rendered by Mermaid from model-generated source. Mermaid's
 * securityLevel:'strict' is the first line of defence, but it has had bypass
 * CVEs and the source is ultimately untrusted LLM output — so we run the
 * rendered SVG through DOMPurify (SVG profile) as defence in depth. This strips
 * <script>, event-handler attributes, and foreignObject-hosted HTML while
 * leaving the diagram intact.
 */
export function sanitizeSvg(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use'],
  });
}
