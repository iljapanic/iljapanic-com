import { allArticles, allNotes, allPages, allPosts } from 'content-collections'
import type { Article, Note, Page, Post } from 'content-collections'

export type { Article, Note, Page, Post }

export type Document = Article | Note | Page | Post

export const allDocuments: Document[] = [
	...allArticles,
	...allNotes,
	...allPages,
	...allPosts,
]
