# Tour Guide Matching System

A modern web application that matches prospective students with the perfect tour guides based on their interests, background, and preferences. The system uses AI-powered matching to create meaningful connections between students and tour guides.

## Project Overview

This project consists of two main components:

### Frontend (Next.js)
- Modern, responsive web interface built with Next.js and TypeScript
- Clean, intuitive UI with real-time matching capabilities
- Features include:
  - Individual student matching
  - Database-wide tour guide matching
  - Recent matches tracking
  - Tour guide information management
  - Data upload functionality

### Backend (FastAPI)
- Robust API server built with FastAPI
- Vector-based matching system using Weaviate
- Features include:
  - Tour guide data management
  - AI-powered matching algorithm
  - CSV data import functionality
  - Vector embeddings for semantic matching

## Key Features

- **Smart Matching**: Uses vector embeddings to match students with tour guides based on:
  - Gender
  - Grade level
  - Residential status
  - Academic interests
  - Extracurricular activities
  - Sports
  - Additional preferences

- **Data Management**:
  - CSV upload support for tour guide data
  - Real-time database updates
  - Efficient data storage and retrieval

- **User Interface**:
  - Clean, modern design
  - Responsive layout
  - Intuitive navigation
  - Real-time updates

## Technology Stack

- **Frontend**:
  - Next.js 15
  - React 19
  - TypeScript
  - Tailwind CSS
  - DaisyUI

- **Backend**:
  - FastAPI
  - Python
  - Weaviate (Vector Database)
  - Pandas (Data Processing)

## Architecture

The system follows a modern microservices architecture:
- Frontend and backend are completely decoupled
- RESTful API communication
- Vector-based matching system for intelligent pairing
- Secure data handling and processing

## Security

- Environment variable management for sensitive data
- CORS protection
- Secure API endpoints
- Protected data upload functionality 