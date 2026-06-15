declare module '*.mdx' {
  import type { ComponentType } from 'react'

  export const frontmatter: {
    title: string
    date: string
    tags: string[]
    excerpt: string
    author?: string
  }

  const MDXContent: ComponentType
  export default MDXContent
}
