import type { ComponentType } from 'react'

export type PostMeta = {
  title: string
  date: string
  tags: string[]
  excerpt: string
  author?: string
}

export type Post = {
  slug: string
  meta: PostMeta
  Component: ComponentType
}

const modules = import.meta.glob('../content/blog/*.mdx', { eager: true }) as Record<
  string,
  { frontmatter: PostMeta; default: ComponentType }
>

export const posts: Post[] = Object.entries(modules)
  .map(([path, mod]) => ({
    slug: path.replace('../content/blog/', '').replace('.mdx', ''),
    meta: mod.frontmatter,
    Component: mod.default,
  }))
  .sort((a, b) => b.meta.date.localeCompare(a.meta.date))

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
