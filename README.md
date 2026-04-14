# CRM Pro

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)

**CRM Pro** is a production-grade operations Customer Relationship Management (CRM) application powered by AI. Built as a comprehensive solution for sales and operations teams, it manages leads through a distinct pipeline, tracks immutable activity timelines, handles automated scheduling, and leverages AI to optimize agent workflows.

## 🔐 Demo Credentials

Use the following credentials to log in and explore the different role-based features of the application:

[Live Demo](https://whispyr-crm-vcpk.vercel.app/) 

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `ibrahimyasin@crm.com` | `admin123` |
| **Agent** | `agentibrahim@crm.com` | `admin123` |


## 📋 Overview

CRM Pro is designed with strict role-based access control (RBAC), server-side validation, and a robust service layer. It moves away from standard CRUD operations by implementing real-world enterprise patterns like append-only audit trails, serverless job scheduling, and centralized data access layers.

### 👥 User Roles
* **Agent:** Frontline operators who manage assigned leads, log calls, set reminders, and generate AI briefs.
* **Manager:** Overseers with access to full pipeline dashboards, KPI metrics, and lead reassignment capabilities.
* **Admin:** System administrators who manage user accounts (invites, role changes, soft deactivations), system configuration, and bulk data exports.

## ✨ Core Features

* **Lead Pipeline Management:** Track leads through distinct stages (New → Contacted → Qualified → Negotiating → Won/Lost) with server-side pagination, sorting, and filtering.
* **Immutable Activity Timeline:** Event-driven architecture where every action (notes, status changes, file uploads) is recorded as an append-only audit trail. 
* **Secure File Management:** Supabase Storage integration for uploading and retrieving lead-specific documents via securely signed URLs.
* **Admin Access & Invites:** Closed registration system. Admins provision accounts which trigger secure setup links via Resend transactional emails.

## 🧠 Key Architecture & Integrations

* **Serverless Scheduling & Idempotency (Upstash QStash & Redis):** Built a robust background job system that doesn't rely on long-running servers. QStash handles the scheduled delivery of reminder webhooks, while **Redis** acts as a fast, in-memory cache to guarantee idempotency and prevent duplicate executions.
* **AI Workflows (Vercel AI Gateway & SDK):** Implemented secure, structured AI model calls to generate data-driven lead briefs and automated call follow-up scripts without writing unconfirmed data to the DB. The Gateway ensures requests are properly routed, monitored, and rate-limited.
* **Transactional Email (Resend):** Configured high-deliverability email routing for automated system alerts and secure, role-based user invitations directly from the server.

## 🛠 Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Full-stack React framework for server components and API routes. |
| **Language** | TypeScript | Strict type safety across the entire stack. |
| **Database & ORM** | Supabase (PostgreSQL) + Prisma 7 | Relational database management, migrations, and type-safe querying. |
| **Authentication** | Supabase Auth | Secure session management and centralized server-side role validation. |
| **Data Fetching** | TanStack Query | Client-side caching, state synchronization, and custom hooks. |
| **Validation** | Zod | Server-side schema validation for all API inputs and mutations. |
| **Background Jobs** | Upstash QStash + Redis | CRON/Scheduled job delivery and cache-based idempotency. |
| **Email** | Resend | High-deliverability transactional emails (invites, notifications). |
| **AI Integration** | Vercel AI SDK + Gateway | Structured LLM outputs for briefs and follow-up generation. |
| **Styling & UI** | Tailwind CSS + shadcn/ui | Enterprise-grade, accessible component library. |

## 🏗 Architecture & Engineering Patterns

This application enforces several strict software engineering best practices:

* **Layered Architecture Pattern:** Business logic is decoupled from controllers/API routes and housed in `src/services/` (e.g., `leadService.ts`), Database operations live in the db file and Schema and validation live in the schema file which works as a DTO layer aswell.
* **Frontend Data Access Layer (DAL):** Component-level `fetch` calls are banned. All client-server communication routes through custom TanStack hooks in `src/tanstack/` (e.g., `useLeads()`, `useCreateLead()`).
* **Centralized Authentication:** A single `authenticateUser()` helper enforces session validity and role-based access on every protected server route.
* **Migration-Driven Database:** All schema alterations are executed strictly through Prisma migrations (`migrate dev` / `migrate deploy`) to ensure local and production parity.
