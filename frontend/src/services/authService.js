/**
 * Authentication Service
 * Handles user login for both Administrators and Employees.
 * Connects to FastAPI /api/auth endpoints with transparent mock fallback.
 */

import { mockApi, request } from './api';

const AUTH_STORAGE_KEY = 'asset_management_auth_user';

const FALLBACK_EMPLOYEES = [
  {
    id: 1,
    employee_code: 'EMP-1001',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@company.com',
    department: 'Engineering',
    designation: 'Lead Backend Engineer',
  },
  {
    id: 2,
    employee_code: 'EMP-1002',
    name: 'Priya Sharma',
    email: 'priya.sharma@company.com',
    department: 'Engineering',
    designation: 'Full Stack Engineer',
  },
  {
    id: 3,
    employee_code: 'EMP-1003',
    name: 'Ananya Roy',
    email: 'ananya.roy@company.com',
    department: 'Product',
    designation: 'Product Manager',
  },
  {
    id: 4,
    employee_code: 'EMP-1004',
    name: 'Vikram Mehta',
    email: 'vikram.mehta@company.com',
    department: 'Design',
    designation: 'Lead UI/UX Designer',
  },
  {
    id: 5,
    employee_code: 'EMP-1005',
    name: 'Neha Gupta',
    email: 'neha.gupta@company.com',
    department: 'Human Resources',
    designation: 'HR Specialist',
  },
];

export const authService = {
  /**
   * Log in user with identifier (email or employee code) and password
   */
  async login(identifier, password, preferredRole = 'admin') {
    const cleanId = (identifier || '').trim().toLowerCase();

    if (!cleanId) {
      throw new Error('Please provide an email or identification code.');
    }

    if (!password || password.length < 3) {
      throw new Error('Password must be at least 3 characters.');
    }

    const user = await request(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({
          identifier: (identifier || '').trim(),
          password,
          preferred_role: preferredRole,
        }),
      },
      async () => {
        // Fallback mock authentication
        await new Promise((resolve) => setTimeout(resolve, 250));

        // Admin authentication
        if (preferredRole === 'admin' || cleanId === 'admin' || cleanId === 'admin@company.com') {
          return {
            id: 999,
            name: 'Alex Rivera',
            email: 'admin@company.com',
            employee_code: 'ADM-001',
            role: 'admin',
            department: 'IT Operations',
            designation: 'Lead Systems Administrator',
            token: `mock-admin-token-${Date.now()}`,
          };
        }

        // Employee authentication
        let employees;
        try {
          employees = await mockApi.getEmployees();
        } catch {
          employees = FALLBACK_EMPLOYEES;
        }
        if (!employees || employees.length === 0) {
          employees = FALLBACK_EMPLOYEES;
        }

        const matched = employees.find(
          (e) =>
            e.employee_code.toLowerCase() === cleanId ||
            e.email.toLowerCase() === cleanId ||
            e.name.toLowerCase().includes(cleanId)
        );

        if (!matched) {
          if (cleanId === 'employee' || cleanId === 'emp') {
            const demoEmp = employees[0] || FALLBACK_EMPLOYEES[0];
            return {
              ...demoEmp,
              role: 'employee',
              token: `mock-emp-token-${Date.now()}`,
            };
          }
          throw new Error(`No employee found matching '${identifier}'. Use EMP-1001 or rahul.kumar@company.com.`);
        }

        return {
          ...matched,
          role: 'employee',
          token: `mock-emp-token-${Date.now()}`,
        };
      }
    );

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Register a new employee account and automatically log in
   */
  async registerEmployee(data) {
    const { name, email, department, designation, employee_code, password } = data;

    if (!name?.trim()) throw new Error('Full name is required.');
    if (!email?.trim()) throw new Error('Work email address is required.');
    if (!password || password.length < 3) throw new Error('Password must be at least 3 characters.');

    const user = await request(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          department: department || 'Engineering',
          designation: designation?.trim() || 'Staff Member',
          employee_code: employee_code?.trim() || undefined,
          password,
        }),
      },
      async () => {
        // Fallback mock registration
        await new Promise((resolve) => setTimeout(resolve, 300));
        let createdEmployee;
        try {
          createdEmployee = await mockApi.createEmployee({
            name: name.trim(),
            email: email.trim(),
            department: department || 'Engineering',
            designation: designation?.trim() || 'Staff Member',
            employee_code: employee_code?.trim() || `EMP-${Date.now().toString().slice(-4)}`,
          });
        } catch (err) {
          throw new Error(err.message || 'Failed to create employee profile.', { cause: err });
        }

        const employeeUser = {
          ...createdEmployee,
          role: 'employee',
          token: `mock-emp-token-${Date.now()}`,
        };
        FALLBACK_EMPLOYEES.push(employeeUser);
        return employeeUser;
      }
    );

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Generate next suggested employee code
   */
  async getSuggestedEmployeeCode() {
    try {
      const emps = await request(
        '/employees',
        { method: 'GET' },
        () => mockApi.getEmployees()
      );
      const numbers = (emps || [])
        .map((e) => {
          const match = (e.employee_code || '').match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const nextNum = numbers.length ? Math.max(...numbers) + 1 : 1001;
      return `EMP-${nextNum}`;
    } catch {
      return `EMP-${1000 + FALLBACK_EMPLOYEES.length + 1}`;
    }
  },

  /**
   * Retrieve current stored user session
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Log out user
   */
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};
