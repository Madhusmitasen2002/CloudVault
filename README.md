# CloudVault – Secure Cloud File Storage

CloudVault is a cloud-based file storage application built with a React frontend, an Express backend, and Supabase for authentication, database, and storage. The project focuses on secure file handling, per-user data isolation, and real-world deployment practices.

---

## Features Implemented

### Authentication & Security
- JWT-based authentication
- Protected backend routes
- Per-user data isolation using Supabase Row Level Security (RLS)
- Secure environment variable handling

### File Management
- File upload to Supabase Storage
- Signed download URLs for secure access
- Rename files
- Soft delete files (marked as deleted, not permanently removed)
- Folder-based organization

### Backend
- Express.js REST API
- Middleware-based authentication
- Supabase service role usage on backend to safely bypass RLS
- Clean separation of frontend and backend concerns

### Frontend
- React-based UI
- Folder navigation
- File actions (upload, download, rename, delete)
- Axios-based API layer with auth interceptors

### Deployment
- Backend deployed on Render
- Supabase used for database, auth, and storage
- Environment-based configuration for production readiness

---

## Tech Stack

- Frontend: React, Tailwind CSS
- Backend: Node.js, Express
- Database & Auth: Supabase (PostgreSQL + RLS)
- Storage: Supabase Storage
- Deployment: Render

---

## Security Notes

- Row Level Security (RLS) ensures users can only access their own files
- Backend uses Supabase service role key (never exposed to frontend)
- Signed URLs are time-limited for secure downloads

---

## Future Enhancements (Optional)

- Trash / Restore view for deleted files
- File and folder sharing with permissions
- Shared-with-me section
- Folder-level actions

---

## Status

This project is considered **complete for internship-level evaluation** and demonstrates real-world backend, security, and deployment concepts.
