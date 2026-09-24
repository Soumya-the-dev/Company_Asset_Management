/**
 * Company Asset Management System - Global Constants
 */

export const ASSET_TYPES = [
  'Laptop',
  'Monitor',
  'Mobile Device',
  'Peripheral',
  'Software License',
  'Other',
];

export const ASSET_STATUSES = [
  'Available',
  'Assigned',
  'In Repair',
  'Return Requested',
  'Retired',
];

export const ASSET_CATEGORIES = [
  'IT Hardware',
  'Office Equipment',
  'Software & Tools',
  'Mobile & Comms',
  'Audio & Visual',
  'General',
];

export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Legal',
];

export const SERVICE_TYPES = [
  'Repair',
  'Maintenance',
  'Screen Replacement',
  'Battery Replacement',
  'Hardware Diagnostic',
  'Software Reinstallation',
  'Upgrade',
  'Inspection',
];

export const SERVICE_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

export const RETURN_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
];

export const CONDITION_OPTIONS = [
  'Brand New',
  'Excellent',
  'Good',
  'Fair',
  'Needs Maintenance',
  'Damaged',
];

export const STATUS_CONFIG = {
  Available: {
    label: 'Available',
    color: '#047857',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    dot: '#10b981',
  },
  Assigned: {
    label: 'Assigned',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    dot: '#3b82f6',
  },
  'In Repair': {
    label: 'In Repair',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    dot: '#f59e0b',
  },
  'Return Requested': {
    label: 'Return Requested',
    color: '#6b21a8',
    bg: '#faf5ff',
    border: '#e9d5ff',
    dot: '#a855f7',
  },
  Retired: {
    label: 'Retired',
    color: '#475569',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    dot: '#64748b',
  },
  OPEN: {
    label: 'Open',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    dot: '#f59e0b',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    dot: '#3b82f6',
  },
  COMPLETED: {
    label: 'Completed',
    color: '#047857',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    dot: '#10b981',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#475569',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    dot: '#64748b',
  },
  PENDING: {
    label: 'Pending',
    color: '#6b21a8',
    bg: '#faf5ff',
    border: '#e9d5ff',
    dot: '#a855f7',
  },
  APPROVED: {
    label: 'Approved',
    color: '#047857',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    dot: '#10b981',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
    dot: '#ef4444',
  },
};
