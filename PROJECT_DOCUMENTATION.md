# 🏥 Admin Portal SaaS - Comprehensive System Documentation

## 1. Project Overview

The **Admin Portal SaaS** is a high-performance, compliant, and visually premium web-based centralized management system designed for healthcare administration. It serves as a command center for managing multiple hospitals, staff, resources, and system administrators efficiently.

### Key Capabilities

- **Multi-Tenant Architecture**: Manage multiple hospitals (Public/Private) from a single dashboard.
- **Role-Based Access Control (RBAC)**: Strict permission boundaries for Super Admins, Hospital Admins, Staff Managers, and Auditors.
- **Real-Time Resource Monitoring**: Live tracking of beds, ventilators, and oxygen availability with critical alerts.
- **Staff Management**: Comprehensive staff directory with shift scheduling and conflict detection.
- **Security**: Enterprise-grade security with account lockout, password policies, and audit logs.

---

## 2. Installation & Setup

### Prerequisites

- **Node.js**: v16 or higher
- **MongoDB**: Local or Atlas connection string

### Quick Start

The project consists of two main parts: `backend` (API) and `admin-portal` (Frontend).

1. **Backend Setup**

   ```bash
   cd backend
   npm install
   # Create .env file with: PORT=5000, MONGO_URI=..., JWT_SECRET=...
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd admin-portal
   npm install
   npm run dev
   ```
   Access the portal at `http://localhost:5173` (or configured port).

---

## 3. User Roles & Permissions

The system strictly enforces the following hierarchy:

| Role               | Access Level     | Responsibilities                                                               |
| ------------------ | ---------------- | ------------------------------------------------------------------------------ |
| **Super Admin**    | `Full Access`    | Create/Delete Hospitals, Manage other Admins, View Global Reports.             |
| **Hospital Admin** | `Hospital Scope` | Manage own hospital's Staff & Resources. Cannot see other hospitals' data.     |
| **Staff Manager**  | `Staff Only`     | Can only add/edit/roster staff members. No access to financial/admin settings. |
| **Auditor**        | `Read Only`      | Can view logs and reports but cannot make any changes.                         |

---

## 4. Operating Manual (How-To)

### 🏥 A. Managing Hospitals

_Accessible by: Super Admin_

**1. Viewing Hospitals**

- Navigate to the **Hospitals** tab.
- **View Modes**: Switch between **Grid View** (Visual cards) and **List View** (Data table) using the toggle top-right.
- **Search**: Use the search bar to find by Name or City.

**2. Adding a New Hospital**

- Click **"Add Hospital"**.
- **Hospital Code**: A unique identifier (e.g., `HOSP-001`).
- **Type**: Select **Public** or **Private**.
- **Services**: Toggle 24/7, Emergency, etc.
- _Note: Government type has been deprecated to simplify compliance._

### 👤 B. Managing Administrators

_Accessible by: Super Admin_

**1. Creating a Hospital Admin**

- Navigate to **Admins** > **Create New**.
- Select Role: **Hospital Admin**.
- **Auto-Email Feature**:
  - Select the target Hospital from the dropdown.
  - Enter the admin's First Name.
  - The system **automatically generates** an official email (e.g., `john@jinnah.com.pk`).
  - _This ensures professional consistency._

### 👩‍⚕️ C. Staff Management & Termination

_Accessible by: Super Admin, Hospital Admin, Staff Manager_

**1. Creating Staff**

- Go to **Staff** > **Add Staff**.
- **Shift Scheduling**: The system auto-detects conflicts. You cannot schedule a staff member for overlapping shifts unless you use an override code (Admin only).

**2. Terminating Staff (Soft Delete)**

- Locate the staff member in the list.
- Click the **Amber Trash Icon** (Terminate) in the actions column.
- **Confirm Termination**: The modal will explain that this is a "Soft Delete".
- **Result**: The staff member immediately disappears from the active list but remains in the database with status `terminated` for audit compliance.

### 📦 D. Resource Management

_Accessible by: Super Admin, Hospital Admin_

The **Resources** page is the critical care dashboard.

**1. Grouped View**

- Resources are **Grouped by Hospital** by default via collapsible sections.
- **Expand All/Collapse All**: Use top buttons to verify multiple facilities quickly.
- **Visual Status**:
  - 🟢 **Green Bar**: Good Availability (>50%)
  - 🟠 **Amber Bar**: Low Availability (20-50%)
  - 🔴 **Red Bar**: Critical Shortage (<20%) - _Action Required!_

**2. Updating Availability**

- Click on any resource card (e.g., "ICU Beds").
- Update the `Available` count directly.
- The `Occupied` count auto-calculates based on `Total - Available`.

---

## 5. Security & Compliance Features

### 🔐 Account Security

- **Lockout Policy**: After 5 failed login attempts, the account is locked for 15 minutes.
- **Password Policy**: Minimum 8 characters required. Backend enforces strict validation.

### 📜 Audit & Logging

- Every critical action (Create Admin, Terminate Staff, Update Resource) is logged in the backend.
- **Auditor Role**: Use the Auditor account to inspect strictly these logs without risk of accidental data modification.

---

## 6. Troubleshooting / FAQ

**Q: I created a Hospital Admin but their email is read-only?**  
A: This is intentional. The system auto-generates the email based on the assigned hospital's domain to ensure data integrity.

**Q: I deleted a staff member but I can't find them in the database?**  
A: Staff are _terminated_, not deleted. They still exist in the database with `status: "terminated"` but are hidden from the active views.

**Q: Why can't I select "Government" as a hospital type?**  
A: The "Government" type was removed to streamline the `Public` vs `Private` classification model per the latest directive. Use "Public" for government facilities.

**Q: The resource progress bar is red?**  
A: This indicates **Critical Availability (<20%)**. Immediate attention is required to free up resources or add capacity.
