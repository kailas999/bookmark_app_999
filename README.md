# Smart Bookmark Manager

## 1. Project Overview

The **Smart Bookmark Manager** is a modern, full-stack web application designed to help users organize, search, and manage their web bookmarks efficiently. Unlike traditional bookmark managers, this application leverages **Artificial Intelligence (Google Gemini)** to automatically generate metadata, descriptions, and tags for saved URLs, making retrieval seamless.

The application features a sleek, responsive user interface built with **Next.js** and **Tailwind CSS**, backed by **Supabase** for robust data storage, authentication, and vector-based search capabilities.

## 2. Key Features

### 🌟 Core Functionality
-   **CRUD Operations**: Create, Read, Update, and Delete bookmarks and collections.
-   **Collections (Folders)**: Organize bookmarks into color-coded collections for better structure.
-   **Favorites**: Quickly mark and access frequently used links.

### 🧠 AI-Powered Automation
-   **Auto-Tagging & Summarization**: When a user adds a link, the system uses **Google Gemini AI** to analyze the content and automatically generate:
    -   A concise description.
    -   Relevant searchable tags.
    -   Title Metadata.

### 🔍 Advanced Search & Discovery
-   **Full-Text Search**: Powerful search capability utilizing PostgreSQL `tsvector` to find bookmarks by title, description, URL, or domain.
-   **Filtering**: Filter bookmarks by specific tags or collections.

### 📊 Analytics Dashboard
-   **Usage Insights**: Visual analytics showing:
    -   Daily bookmarking activity.
    -   Top domains (e.g., GitHub, YouTube).
    -   Most used tags.
    -   Collection distribution.

### 🛠️ Utilities
-   **Browser Import**: Ability to import existing bookmarks from browser HTML export files.
-   **Dark/Light Mode**: Fully responsive theme support.

## 3. Technology Stack

### Frontend
-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Radix UI](https://www.radix-ui.com/) (Headless accessibility primitives)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Forms**: React Hook Form + Zod (Validation)
-   **Data Visualization**: Recharts

### Backend & Database
-   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Authentication**: Supabase Auth
-   **ORM/Client**: Supabase JS Client
-   **AI Model**: Google Gemini (via `@google/generative-ai` SDK)

## 4. Database Schema

The simple yet powerful relational schema consists of:

-   **`collections`**: Stores folder names and colors.
    -   *Relationships*: One-to-Many with Bookmarks.
-   **`bookmarks`**: Stores the core link data, metadata, favorites status, and search vectors.
    -   *Fields*: `title`, `url`, `description`, `thumbnail_url`, `search_vector`, etc.
-   **`bookmark_tags`**: A specialized table for managing many-to-many relationships between bookmarks and tags.
-   **Views**: SQL Views (`bookmark_stats_daily`, `tag_stats`) are used for efficient analytics querying.

## 5. Project Structure

```
├── app/
│   ├── api/                 # Backend API Routes
│   │   ├── ai/              # AI metadata generation endpoint
│   │   ├── import-bookmarks/# File upload & parsing logic
│   ├── (auth)/              # Authentication pages (Login/Signup)
│   ├── layout.tsx           # Root layout with Theme Provider
│   └── page.tsx             # Main Dashboard
├── components/              # Reusable React Components
│   ├── ui/                  # Shadcn/Radix UI primitives
│   ├── bookmark-card.tsx    # Individual bookmark display
│   ├── analytics-dashboard.tsx # Charts and stats
│   ├── app-sidebar.tsx      # Main navigation
│   └── add-bookmark-modal.tsx # Form for adding new links
├── lib/                     # Utilities (Supabase client, helpers)
├── supabase-schema.sql      # Core database structure
└── supabase-schema-advanced.sql # Advanced features (Search, Analytics)
```

## 6. Setup & Installation

### Prerequisites
-   Node.js (v18+)
-   Supabase Account
-   Google Cloud Account (for Gemini API Key)

### Steps

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd bookmark-app
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Configuration**
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_google_gemini_key
    ```

4.  **Database Setup**
    Run the SQL scripts provided in `supabase-schema.sql` and `supabase-schema-advanced.sql` in your Supabase SQL Editor to create tables and policies.

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## 7. Challenges & Solutions

### 1. The "Manual Entry" Fatigue 😫
**Problem**: One of the biggest friction points in bookmark managers is the need to manually type out titles, descriptions, and tags. This process is tedious and often results in messy, unorganized lists.

**Solution**: 
We automated this entire workflow using **Google Gemini AI**.
-   **Smart Fetching**: The system first scrapes the URL for Open Graph metadata.
-   **AI Analysis**: If metadata is sparse, Gemini analyzes the page content to generate a concise, human-readable summary and auto-suggests relevant tags.
-   **Result**: Users simply paste a link, and the card is populated instantly with rich, searchable details.

### 2. Real-time Interaction
**Problem**: Users expect instant feedback when adding or deleting items, without reloading the page.
**Solution**: Leveraged **Supabase Realtime** to listen for database changes (inserts/deletes) and update the UI state immediately, creating a snappy, app-like experience.

### 3. Efficient Search
**Problem**: Simple `LIKE` queries in SQL are slow and inaccurate for large datasets.
**Solution**: Implemented PostgreSQL's built-in **`tsvector`** for full-text search, allowing users to find bookmarks by matching keywords in the title, description, or URL domain.

## 8. API Endpoints

### `POST /api/ai/generate-metadata`
-   **Purpose**: Generates title, description, and tags for a given URL.
-   **Input**: `{ "url": "https://example.com" }`
-   **Output**: JSON object with metadata.

### `POST /api/import-bookmarks`
-   **Purpose**: Parses an uploaded Netscape HTML bookmark file and batch inserts them into the database.
