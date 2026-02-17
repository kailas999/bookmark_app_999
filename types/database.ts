export interface Database {
    public: {
        Tables: {
            bookmarks: {
                Row: {
                    id: string
                    user_id: string
                    url: string
                    title: string
                    favicon: string | null
                    collection: string | null
                    is_favorite: boolean
                    created_at: string
                    updated_at: string
                    description: string | null
                    thumbnail_url: string | null
                    author: string | null
                    published_at: string | null
                    domain: string | null
                    search_vector: unknown | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    url: string
                    title: string
                    favicon?: string | null
                    collection?: string | null
                    is_favorite?: boolean
                    created_at?: string
                    updated_at?: string
                    description?: string | null
                    thumbnail_url?: string | null
                    author?: string | null
                    published_at?: string | null
                    domain?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    url?: string
                    title?: string
                    favicon?: string | null
                    collection?: string | null
                    is_favorite?: boolean
                    created_at?: string
                    updated_at?: string
                    description?: string | null
                    thumbnail_url?: string | null
                    author?: string | null
                    published_at?: string | null
                    domain?: string | null
                }
            }
            collections: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    color: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    color: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    color?: string
                    created_at?: string
                }
            }
            bookmark_tags: {
                Row: {
                    id: string
                    bookmark_id: string
                    tag: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    bookmark_id: string
                    tag: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    bookmark_id?: string
                    tag?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_popular_tags: {
                Args: {
                    user_uuid: string
                    search_term?: string
                    limit_count?: number
                }
                Returns: Array<{ tag: string; count: number }>
            }
            search_bookmarks: {
                Args: {
                    user_uuid: string
                    search_query: string
                    limit_count?: number
                }
                Returns: Array<{
                    id: string
                    title: string
                    url: string
                    description: string | null
                    thumbnail_url: string | null
                    favicon: string | null
                    collection: string | null
                    is_favorite: boolean
                    created_at: string
                    rank: number
                }>
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
