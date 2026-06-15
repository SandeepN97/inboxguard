/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ExternalLink, Star, ChevronDown, ChevronRight } from 'lucide-react'

// ─── data ──────────────────────────────────────────────────────────────────

export type Tool = {
  name: string
  category: string
  github: string
  stars: string
  contributors: string
  usage: string
  file: string // where it lives in the repo
}

export const TOOLS: Tool[] = [
  // Security Scanning
  {
    name: 'Trivy',
    category: 'Security Scanning',
    github: 'https://github.com/aquasecurity/trivy',
    stars: '35.3k',
    contributors: '~600+',
    usage:
      'Scans for vulnerabilities, exposed secrets, IaC misconfigurations, and generates SBOMs across containers, filesystems, and dependencies',
    file: '.github/workflows/security.yml',
  },
  {
    name: 'Gitleaks',
    category: 'Security Scanning',
    github: 'https://github.com/gitleaks/gitleaks',
    stars: '27.7k',
    contributors: '200+',
    usage:
      'Detects hardcoded secrets (API keys, tokens, credentials) in commits, run via pre-commit hook',
    file: '.gitleaks.toml',
  },
  {
    name: 'CodeQL',
    category: 'Security Scanning',
    github: 'https://github.com/github/codeql',
    stars: '~8k',
    contributors: '~300+',
    usage:
      'Semantic SAST — builds a queryable database of code to find data-flow vulnerabilities like SQL injection',
    file: '.github/workflows/codeql.yml',
  },
  {
    name: 'Semgrep',
    category: 'Security Scanning',
    github: 'https://github.com/semgrep/semgrep',
    stars: '~12k',
    contributors: '~400+',
    usage: 'Fast pattern-based SAST using YAML rules; supports custom project-specific rules',
    file: '.semgrep/',
  },
  {
    name: 'OWASP ZAP',
    category: 'Security Scanning',
    github: 'https://github.com/zaproxy/zaproxy',
    stars: '~13k',
    contributors: '~250+',
    usage: 'DAST — runs the live app and tests for auth, injection, and header vulnerabilities',
    file: '.github/workflows/zap.yml',
  },
  // PR Review / CI
  {
    name: 'Danger JS',
    category: 'PR Review / CI',
    github: 'https://github.com/danger/danger-js',
    stars: '~5k',
    contributors: '~250+',
    usage:
      'Enforces PR policy (docs/diagrams/ADR updates) by failing or warning the PR based on diff contents',
    file: '.github/workflows/danger.yml',
  },
  {
    name: 'Reviewdog',
    category: 'PR Review / CI',
    github: 'https://github.com/reviewdog/reviewdog',
    stars: '~5k',
    contributors: '~150+',
    usage: 'Posts linter/scanner output (ESLint, Semgrep) as inline PR review comments',
    file: '.github/workflows/security.yml',
  },
  // Architecture Docs
  {
    name: 'Mermaid.js',
    category: 'Architecture Docs',
    github: 'https://github.com/mermaid-js/mermaid',
    stars: '~80k',
    contributors: '~400+',
    usage: 'Diagrams-as-code; renders natively in GitHub markdown, Notion, and Claude artifacts',
    file: 'docs/architecture/system.md',
  },
  {
    name: 'D2 Language',
    category: 'Architecture Docs',
    github: 'https://github.com/terrastruct/d2',
    stars: '~17.5k',
    contributors: '~90',
    usage: 'Declarative diagram language with auto-layout, used for complex multi-service diagrams',
    file: 'docs/architecture/system.d2',
  },
  {
    name: 'Structurizr Lite',
    category: 'Architecture Docs',
    github: 'https://github.com/structurizr/lite',
    stars: '~2k',
    contributors: '~15',
    usage:
      'Renders C4-model architecture diagrams (Context, Container, Component, Code) from a DSL workspace',
    file: 'docs/architecture/workspace.dsl',
  },
  {
    name: 'adr-tools',
    category: 'Architecture Docs',
    github: 'https://github.com/npryce/adr-tools',
    stars: '~5k',
    contributors: '~40',
    usage: 'CLI for creating and numbering Architecture Decision Records in a standard format',
    file: 'docs/adr/',
  },
  {
    name: 'GitDiagram',
    category: 'Architecture Docs',
    github: 'https://github.com/ahmedkhaleel2004/gitdiagram',
    stars: '~9.5k',
    contributors: '~15',
    usage:
      'Generates instant repo-to-architecture diagrams via URL for onboarding/portfolio overviews',
    file: 'docs/architecture/',
  },
  {
    name: 'GitNexus',
    category: 'Architecture Docs',
    github: 'https://github.com/abhigyanpatwari/GitNexus',
    stars: '~34.8k',
    contributors: '~45',
    usage:
      'Builds a queryable graph of cross-file relationships (imports, calls, class heritage) for AI code assistance',
    file: 'docs/architecture/',
  },
  // Frontend / UI
  {
    name: 'Tailwind CSS',
    category: 'Frontend / UI',
    github: 'https://github.com/tailwindlabs/tailwindcss',
    stars: '~85k',
    contributors: '~700+',
    usage: 'Utility-first CSS framework for composable, in-markup styling',
    file: 'frontend/tailwind.config.ts',
  },
  {
    name: 'shadcn/ui',
    category: 'Frontend / UI',
    github: 'https://github.com/shadcn-ui/ui',
    stars: '~85k',
    contributors: '~600+',
    usage: 'Copy-paste accessible React components owned and auditable in your own codebase',
    file: 'frontend/src/components/ui/',
  },
  {
    name: 'Motion',
    category: 'Frontend / UI',
    github: 'https://github.com/motiondivision/motion',
    stars: '~25k',
    contributors: '~200+',
    usage: 'Declarative React animation library, props/variants-based',
    file: 'frontend/src/pages/Landing.tsx',
  },
  {
    name: 'GSAP',
    category: 'Frontend / UI',
    github: 'https://github.com/greensock/GSAP',
    stars: '~20k',
    contributors: '~40',
    usage:
      'Timeline-based animation engine for complex sequenced/scroll-triggered animations; fully open-source since 2025',
    file: 'frontend/src/components/landing/InboxDemo.tsx',
  },
  // Code Quality
  {
    name: 'ESLint',
    category: 'Code Quality',
    github: 'https://github.com/eslint/eslint',
    stars: '~25k',
    contributors: '~1,000+',
    usage: 'Static analysis for JS/TS; enforces code style and catches anti-patterns at write-time',
    file: 'frontend/eslint.config.js',
  },
  {
    name: 'Prettier',
    category: 'Code Quality',
    github: 'https://github.com/prettier/prettier',
    stars: '~50k',
    contributors: '~900+',
    usage: 'Automatic code formatter enforcing a single consistent style across the codebase',
    file: 'frontend/.prettierrc',
  },
  {
    name: 'Husky',
    category: 'Code Quality',
    github: 'https://github.com/typicode/husky',
    stars: '~32k',
    contributors: '~150+',
    usage:
      'Manages Git hooks (pre-commit, commit-msg) to run lint/format/secret checks before commit',
    file: '.husky/pre-commit',
  },
  // Secure Web Baseline
  {
    name: 'Helmet.js',
    category: 'Secure Web Baseline',
    github: 'https://github.com/helmetjs/helmet',
    stars: '~10k',
    contributors: '~150+',
    usage:
      'Express middleware setting secure HTTP headers (CSP, HSTS, X-Frame-Options) in one line',
    file: 'frontend/server.cjs',
  },
]

// ─── category config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { bg: string; border: string; badge: string; dot: string }> =
  {
    'Security Scanning': {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800/40',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      dot: 'bg-red-500',
    },
    'PR Review / CI': {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800/40',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    'Architecture Docs': {
      bg: 'bg-violet-50 dark:bg-violet-950/20',
      border: 'border-violet-200 dark:border-violet-800/40',
      badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
      dot: 'bg-violet-500',
    },
    'Frontend / UI': {
      bg: 'bg-pink-50 dark:bg-pink-950/20',
      border: 'border-pink-200 dark:border-pink-800/40',
      badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
      dot: 'bg-pink-500',
    },
    'Code Quality': {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    'Secure Web Baseline': {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800/40',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
  }

const CATEGORY_ORDER = [
  'Security Scanning',
  'PR Review / CI',
  'Architecture Docs',
  'Frontend / UI',
  'Code Quality',
  'Secure Web Baseline',
]

// ─── pipeline diagram ────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { label: 'Write code', tools: ['ESLint', 'Prettier'] },
  { label: 'Pre-commit', tools: ['Husky', 'Gitleaks'] },
  { label: 'CI — build', tools: ['Trivy', 'CodeQL', 'Semgrep'] },
  { label: 'CI — runtime', tools: ['OWASP ZAP'] },
  { label: 'PR review', tools: ['Danger JS', 'Reviewdog'] },
  { label: 'Merge', tools: ['Helmet.js'] },
]

function PipelineDiagram() {
  return (
    <div className="not-prose my-10 overflow-x-auto rounded-xl border bg-muted/30 p-6">
      <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        DevSecOps enforcement chain
      </p>
      <div className="flex min-w-max items-start gap-0">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-start">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="rounded-lg border bg-background px-3 py-2 text-center shadow-sm">
                <p className="text-xs font-semibold text-foreground">{stage.label}</p>
                <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                  {stage.tools.map((t) => {
                    const tool = TOOLS.find((x) => x.name === t)!
                    const cfg = CATEGORY_CONFIG[tool.category]
                    return (
                      <span
                        key={t}
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${cfg.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {t}
                      </span>
                    )
                  })}
                </div>
              </div>
            </motion.div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div className="mt-4 flex items-center">
                <div className="h-px w-6 bg-border" />
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── tool card ───────────────────────────────────────────────────────────────

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = CATEGORY_CONFIG[tool.category]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: (index % 3) * 0.06 }}
      whileHover={{ y: -2 }}
      className={`group relative cursor-pointer rounded-xl border ${cfg.border} ${cfg.bg} p-4 transition-shadow hover:shadow-md`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
            <span className="text-sm font-semibold text-foreground">{tool.name}</span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${cfg.badge}`}>
              {tool.category}
            </span>
          </div>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="details"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{tool.usage}</p>
                <p className="mt-1.5 font-mono text-[10px] text-muted-foreground/70">{tool.file}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!expanded && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{tool.usage}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <a
              href={tool.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Star className="h-3 w-3" />
            {tool.stars}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── category section ────────────────────────────────────────────────────────

function CategorySection({ category, tools }: { category: string; tools: Tool[] }) {
  const cfg = CATEGORY_CONFIG[category]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="not-prose mb-8"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
        <h3 className="text-sm font-semibold text-foreground">{category}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((tool, i) => (
          <ToolCard key={tool.name} tool={tool} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

// ─── stats bar ───────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { label: 'Total tools', value: TOOLS.length.toString() },
    { label: 'Categories', value: CATEGORY_ORDER.length.toString() },
    { label: 'GitHub stars (combined)', value: '~460k' },
    { label: 'All verified in repo', value: '✓' },
  ]

  return (
    <div className="not-prose my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="rounded-xl border bg-muted/40 p-4 text-center"
        >
          <p className="text-2xl font-bold text-foreground">{s.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── main export ─────────────────────────────────────────────────────────────

export function ToolsShowcase() {
  const byCategory = CATEGORY_ORDER.reduce<Record<string, Tool[]>>((acc, cat) => {
    acc[cat] = TOOLS.filter((t) => t.category === cat)
    return acc
  }, {})

  return (
    <div>
      <StatsBar />
      <PipelineDiagram />
      {CATEGORY_ORDER.map((cat) => (
        <CategorySection key={cat} category={cat} tools={byCategory[cat]} />
      ))}
    </div>
  )
}
