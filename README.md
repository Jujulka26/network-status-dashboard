# Installation Guide

## Prerequisites
* Node.js

## 1. Package Manager Setup
Global installation of `pnpm` via `npm`:
npm install -g pnpm

## 2. Dependency Installation
Execution within project root directory:
pnpm install

### Build script approval (if prompted for sharp):
pnpm approve-builds

## 3. Server Initialization
Development server launch:
pnpm dev

Dashboard access: http://localhost:3000

## 4. Network Access Configuration (Optional)
Cross-origin configuration for mobile/LAN testing.
Addition to next.config.mjs:

JavaScript
const nextConfig = {
  allowedDevOrigins: ['YOUR_IP_ADDRESS'],
};

export default nextConfig;
