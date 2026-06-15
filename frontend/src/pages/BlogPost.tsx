import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Calendar, Tag, Shield } from 'lucide-react'
import { getPost, formatDate } from '@/lib/blog'
import { Badge } from '@/components/ui/badge'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPost(slug) : undefined

  if (!post) return <Navigate to="/blog" replace />

  const { meta, Component } = post

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All posts
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-semibold tracking-tight">InboxGuard</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Post header */}
          <div className="mb-10 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 text-[11px]">
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight">{meta.title}</h1>

            <p className="text-base leading-relaxed text-muted-foreground">{meta.excerpt}</p>

            <div className="flex items-center gap-1.5 border-t pt-4 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(meta.date)}
              {meta.author && <span className="ml-3">by {meta.author}</span>}
            </div>
          </div>

          {/* MDX content */}
          <div className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-xl prose-h3:text-base prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-lg prose-pre:border prose-pre:bg-muted/50 prose-table:text-sm prose-th:font-semibold">
            <Component />
          </div>

          {/* Footer nav */}
          <div className="mt-16 border-t pt-8">
            <Link
              to="/blog"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all posts
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
