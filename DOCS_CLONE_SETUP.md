# Google Docs Clone - Setup Guide

This is a full-stack collaborative document editor built with modern web technologies, inspired by Google Docs.

## Features

✅ **Real-time Collaborative Editing** - Multiple users can edit documents simultaneously with cursor tracking
✅ **Rich Text Editing** - Full formatting capabilities with TipTap
✅ **Document Management** - Create, read, update, and delete documents
✅ **User Authentication** - Secure authentication with Clerk
✅ **Real-time Database** - Built with Convex
✅ **Beautiful UI** - Styled with Tailwind CSS and Shadcn UI
✅ **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 15 & React 19
- **Styling**: Tailwind CSS & Shadcn UI
- **Rich Text Editor**: TipTap
- **Real-time Collaboration**: Liveblocks & Y.js
- **Database**: Convex
- **Authentication**: Clerk
- **Icons**: Lucide React
- **CSS Utilities**: Class Variance Authority (CVA) & clsx

## Setup Instructions

### 1. Install Dependencies

Dependencies have already been installed. If you need to install again:

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual credentials:

#### Clerk Setup
1. Go to https://dashboard.clerk.com
2. Create a new application
3. Copy your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

#### Convex Setup
1. Go to https://convex.dev
2. Create a new project
3. Copy your deployment URL for `NEXT_PUBLIC_CONVEX_URL`
4. Run: `npm run convex deploy` to deploy your schema

#### Liveblocks Setup (Optional - for enhanced collaboration)
1. Go to https://liveblocks.io
2. Create a new project
3. Copy your `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`

#### Y.js WebSocket (Optional - for local development)
For local development without a hosted Y.js provider:
```bash
npm install -g y-websocket-server
y-websocket-server # Runs on ws://localhost:1234
```

### 3. Deploy Convex Schema

```bash
npm run convex deploy
```

This will create the necessary database tables.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/notes](http://localhost:3000/notes) in your browser.

## Project Structure

```
app/
├── notes/                    # Notes listing page
│   ├── page.jsx             # Main notes page
│   └── [documentId]/        # Individual document editor
│       └── page.jsx         # Document editor page
└── api/                     # API routes (if needed)

components/
├── DocumentEditor.jsx       # Main collaborative editor with TipTap
├── DocumentList.jsx         # Document listing and management
└── ui/                      # Shadcn UI components

convex/
├── schema.ts               # Database schema definitions
├── documents.js            # Document mutations and queries
└── auth.config.js          # Authentication configuration

lib/
└── liveblocks.js          # Liveblocks configuration

styles/
└── editor.css             # TipTap editor styling
```

## File Descriptions

### Core Components

**DocumentEditor.jsx** - The main editor component with:
- TipTap rich text editor
- Formatting toolbar (bold, italic, underline, etc.)
- List support (bullet points, ordered lists, task lists)
- Image and link insertion
- Real-time cursor tracking with Liveblocks
- Undo/Redo functionality

**DocumentList.jsx** - Document management interface:
- Search and filter documents
- Create new documents
- Delete documents
- Share documents (ready for implementation)
- View last edited timestamp

**convex/documents.js** - Backend operations:
- `createDocument` - Create a new document
- `updateDocument` - Update document content and title
- `deleteDocument` - Delete a document
- `getDocument` - Fetch a single document
- `listDocuments` - List all user documents
- `shareDocument` - Share documents with other users
- `getCursorPositions` - Track collaborative cursors

**convex/schema.ts** - Database schema:
- `documents` - Main document storage
- `documentShares` - Document sharing records
- `cursorPositions` - Real-time cursor tracking

## Usage

### Creating a Document
1. Click "New Document" button
2. Enter a title
3. Click "Create Document"
4. Start typing in the editor

### Formatting Text
Use the toolbar buttons or keyboard shortcuts:
- **Bold**: Ctrl+B
- **Italic**: Ctrl+I
- **Underline**: Ctrl+U
- **Strikethrough**: Ctrl+Shift+X

### Collaborative Editing
1. Share the document URL with collaborators
2. When multiple users edit, you'll see their cursors
3. Changes are synced in real-time

### Editing Document Title
Click on the document title at the top to edit it

## Advanced Features to Implement

1. **Document Sharing**
   - Implement the Share button in DocumentEditor
   - Add permission levels (view/edit)
   - Show shared user avatars

2. **Comments & Mentions**
   - Add commenting system
   - Mention users with @username
   - Discussion threads

3. **Version History**
   - Track document versions
   - Restore previous versions
   - Show version timeline

4. **Templates**
   - Create document templates
   - Quick-start templates for common uses

5. **Offline Support**
   - Service Worker integration
   - Local storage fallback
   - Sync when online

6. **Export Options**
   - Export as PDF
   - Export as DOCX
   - Export as Markdown

7. **Advanced Formatting**
   - Tables
   - Embeds (YouTube, etc.)
   - Math equations
   - Code highlighting

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables
5. Deploy!

### Important Notes for Production

1. Update Clerk redirect URLs to your production domain
2. Set up a production Convex deployment
3. Configure production Y.js provider or use Liveblocks exclusively
4. Enable HTTPS for secure WebSocket connections
5. Set up proper CORS policies

## Troubleshooting

### "Document not found" error
- Ensure you're logged in with Clerk
- Check that the document ID is correct in the URL

### Real-time collaboration not working
- Check that Liveblocks API key is configured
- Verify WebSocket endpoint is accessible
- Check browser console for errors

### Convex queries not working
- Run `npm run convex deploy` to sync schema
- Check that environment variables are set
- Verify Convex project is deployed

## Performance Tips

1. **Debounce content updates** - Currently updates on every change
2. **Paginate document lists** - For users with many documents
3. **Optimize images** - Use next/image for optimization
4. **Implement lazy loading** - For large documents
5. **Use React.memo** - For editor toolbar components

## Security Considerations

1. **Document Permissions** - Implement proper authorization checks
2. **User Validation** - Always verify user identity on backend
3. **Rate Limiting** - Add rate limits to mutations
4. **XSS Protection** - TipTap handles most, but validate content
5. **Access Control** - Check user permissions before document access

## API Reference

### Document Operations

```typescript
// Create a document
createDocument({
  title: string
  userId: string
  content: string
  organizationId?: string
})

// Update a document
updateDocument({
  documentId: Id<"documents">
  content: string
  title?: string
  userId: string
})

// Delete a document
deleteDocument({
  documentId: Id<"documents">
  userId: string
})

// Get a single document
getDocument({
  documentId: Id<"documents">
})

// List user's documents
listDocuments({
  userId: string
  organizationId?: string
})
```

## License

MIT - Feel free to use this for personal or commercial projects!

## Support

For issues or questions:
- Check the [TipTap docs](https://tiptap.dev)
- Check the [Convex docs](https://docs.convex.dev)
- Check the [Liveblocks docs](https://liveblocks.io/docs)
- Check the [Clerk docs](https://clerk.com/docs)
