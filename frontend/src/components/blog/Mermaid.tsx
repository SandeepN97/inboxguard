import DOMPurify from 'dompurify'
import { useEffect, useId, useRef } from 'react'

type Props = { chart: string; caption?: string }

export function Mermaid({ chart, caption }: Props) {
  const id = useId().replace(/:/g, '')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      const mermaid = (await import('mermaid')).default
      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'neutral',
        fontFamily: 'inherit',
        fontSize: 13,
        flowchart: { curve: 'basis', padding: 16 },
        sequence: { actorMargin: 60, messageFontSize: 13 },
      })
      if (cancelled || !ref.current) return
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart.trim())
        // SVG from Mermaid is repo-controlled, but sanitize anyway — defense in depth
        const clean = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
        })
        if (!cancelled && ref.current) ref.current.innerHTML = clean
      } catch {
        if (!cancelled && ref.current) ref.current.textContent = chart
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [chart, id])

  return (
    <figure className="not-prose my-8">
      <div
        ref={ref}
        className="overflow-x-auto rounded-xl border bg-muted/20 px-4 py-6 [&>svg]:mx-auto [&>svg]:max-w-full"
      />
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
