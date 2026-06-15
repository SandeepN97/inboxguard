import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Shield, Calendar, Tag } from 'lucide-react'
import { posts, formatDate } from '@/lib/blog'
import { Badge } from '@/components/ui/badge'

export function BlogList() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-semibold tracking-tight">InboxGuard</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">Blog</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary/60">
            Build log
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Design, progress & learning</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Daily notes on what got built, why the architecture works this way, and what resources
            were actually useful.
          </p>
        </motion.div>

        <div className="flex flex-col gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="bg-card group flex flex-col gap-3 rounded-xl border p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {post.meta.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-[11px]">
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h2 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                  {post.meta.title}
                </h2>

                <p className="text-sm leading-relaxed text-muted-foreground">{post.meta.excerpt}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(post.meta.date)}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Read post <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </main>
    </div>
  )
}
