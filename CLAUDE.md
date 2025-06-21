# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tour Guide Matching System - a full-stack web application that uses AI-powered matching to connect prospective students with suitable tour guides based on their interests, background, and preferences.

## Architecture

**Frontend (Next.js)**: Next.js 15 with React 19, TypeScript, Tailwind CSS + DaisyUI
**Backend (FastAPI)**: Python FastAPI with Supabase PostgreSQL database
**AI/Vector Search**: Weaviate for semantic matching, OpenAI for embeddings
**Authentication**: Supabase Auth with school-based multi-tenant access control

## Development Commands

### Frontend
```bash
cd nextjs
npm run dev    # Development server (localhost:3000)
npm run build  # Production build
npm run lint   # ESLint checking
```

### Backend
```bash
cd fastapi
pip install -r requirements.txt
uvicorn api.main:app --reload  # Development server
```

## Key Architecture Components

### Multi-Tenant Structure
- School-based access control via CEEB codes in `admin_to_school` table
- School-specific API keys stored in `school_api_keys` table
- Each school has isolated Weaviate and OpenAI credentials

### Core Matching Algorithm (`fastapi/api/matching.py`)
- Vector-based semantic matching using Weaviate
- Factors: gender, grade, residential status, academic interests, sports, extracurriculars
- Retrieves top matches with similarity scores

### Authentication Flow
- Supabase JWT tokens for API authentication
- Custom AuthContext in frontend (`nextjs/src/contexts/AuthContext.tsx`)
- Protected routes and API endpoints

### Data Management
- Tour guide CRUD operations with vector embedding sync
- Visiting student profile management
- CSV bulk upload functionality
- Real-time database synchronization between Supabase and Weaviate

## Entry Points

- **Frontend**: `nextjs/src/app/page.tsx`
- **Backend**: `fastapi/api/main.py`
- **Matching Logic**: `fastapi/api/matching.py`
- **Database Client**: `fastapi/api/supabase_client.py`

## Critical Security Notes

⚠️ **SECURITY VULNERABILITIES PRESENT** - Check `TODO.md` for critical items:
- Hardcoded credentials in `fastapi/get_token_and_test.py`
- Information disclosure in error messages
- CORS configuration needs production domains
- Missing rate limiting and token validation

## Environment Configuration

- Root `.env` file for shared configuration
- `nextjs/.env.local` for frontend-specific variables
- Supabase, Weaviate, and OpenAI API keys required for full functionality