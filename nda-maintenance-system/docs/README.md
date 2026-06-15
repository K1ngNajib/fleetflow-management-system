# NDA Fleet Maintenance & Logistics Command System

This folder documents the offline-first browser application for Nigerian Defence Academy fleet maintenance operations.

## Operation

Open `../index.html` in a modern browser. The system uses IndexedDB with localStorage fallback, requires no internet, and stores all operational data on the local browser profile.

## Default Administrator

- Username: `admin`
- Password: `admin123`

## Core Modules

- Dashboard command KPIs and maintenance tracking center
- Vehicle register and service schedule fields
- Maintenance jobs with workflow statuses
- Servicing schedule calculations
- Inventory and spare-parts stock usage
- Notification center for service, mileage, overdue, and stock alerts
- Printable reports using `window.print()`
- User management and audit logs

## Currency

All costs are displayed in Nigerian Naira (`₦`).
