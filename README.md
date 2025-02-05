# 808Mystic - E-commerce Platform

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/duongthanhphu/808mystic/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)

Shopee-like marketplace platform with multi-category support and advanced database design.

## Features
- Multi-category e-commerce platform inspired by Shopee
- Optimized PostgreSQL database with efficient indexing and data relationships
- Role-Based Access Control (RBAC) for user authorization
- RESTful API built with Express.js and Node.js
- Responsive React UI with dynamic product management

## Tech Stack
- **Frontend**: React, Redux, Axios, Tailwind CSS
- **Backend**: Node.js, Express.js, PostgreSQL
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, Bcrypt
- **Tools**: Postman, Swagger, Git

## Installation
```bash
git clone https://github.com/duongthanhphu/808mystic.git
cd 808mystic
```
**Backend Setup**
```
cd backend
npm install
cp .env.example .env # Update PostgreSQL credentials
npx prisma migrate dev
npm start

```
**Frontend Setup**
```
cd ../frontend
npm install
cp .env.example .env # Set API endpoint
npm start
```
