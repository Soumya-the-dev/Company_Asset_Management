/**
 * In-Memory Mock Data Store
 * Used as a fallback when backend is offline or VITE_USE_MOCK=true.
 */

let mockAssets = [
  {
    id: 1,
    asset_tag: 'LAP-001',
    name: 'MacBook Pro 16" (M3 Max)',
    asset_type: 'Laptop',
    category: 'IT Hardware',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16',
    serial_number: 'C02G4589MD6R',
    purchase_date: '2025-03-12',
    purchase_cost: 3499.00,
    status: 'Assigned',
    description: '36GB RAM, 1TB SSD, Space Black. Assigned for high-perf dev.',
    specifications: '36GB RAM, 1TB SSD, Space Black. Assigned for high-perf dev.',
    created_at: '2025-03-12T10:00:00Z',
    updated_at: '2025-03-15T14:30:00Z',
  },
  {
    id: 2,
    asset_tag: 'LAP-002',
    name: 'Dell XPS 15 (9530)',
    asset_type: 'Laptop',
    category: 'IT Hardware',
    manufacturer: 'Dell',
    model: 'XPS 15 OLED',
    serial_number: 'DL9530-8842',
    purchase_date: '2025-05-20',
    purchase_cost: 2199.00,
    status: 'Available',
    description: 'Intel i9 13th Gen, 32GB RAM, 1TB SSD, RTX 4070.',
    specifications: 'Intel i9 13th Gen, 32GB RAM, 1TB SSD, RTX 4070.',
    created_at: '2025-05-20T09:15:00Z',
    updated_at: '2025-05-20T09:15:00Z',
  },
  {
    id: 3,
    asset_tag: 'MON-001',
    name: 'Dell UltraSharp 32" 4K',
    asset_type: 'Monitor',
    category: 'IT Hardware',
    manufacturer: 'Dell',
    model: 'U3223QE',
    serial_number: 'CN-0K7H62-74261',
    purchase_date: '2025-01-10',
    purchase_cost: 899.99,
    status: 'Assigned',
    description: 'IPS Black panel, 90W USB-C hub, RJ45 Ethernet.',
    specifications: 'IPS Black panel, 90W USB-C hub, RJ45 Ethernet.',
    created_at: '2025-01-10T11:00:00Z',
    updated_at: '2025-02-01T08:00:00Z',
  },
  {
    id: 4,
    asset_tag: 'MON-002',
    name: 'LG 27" UltraFine 5K',
    asset_type: 'Monitor',
    category: 'IT Hardware',
    manufacturer: 'LG',
    model: '27MD5KL-B',
    serial_number: 'LG5K-990234',
    purchase_date: '2025-04-18',
    purchase_cost: 1299.00,
    status: 'In Repair',
    description: 'Screen flicker issue reported by user. Sent to LG Care.',
    specifications: 'Screen flicker issue reported by user. Sent to LG Care.',
    created_at: '2025-04-18T10:00:00Z',
    updated_at: '2026-01-10T15:20:00Z',
  },
  {
    id: 5,
    asset_tag: 'MOB-001',
    name: 'iPhone 15 Pro 256GB',
    asset_type: 'Mobile Device',
    category: 'Mobile & Comms',
    manufacturer: 'Apple',
    model: 'iPhone 15 Pro',
    serial_number: 'F17D9938NQ8L',
    purchase_date: '2025-09-25',
    purchase_cost: 1099.00,
    status: 'Return Requested',
    description: 'Natural Titanium. QA testing mobile build. Pending return.',
    specifications: 'Natural Titanium. QA testing mobile build. Pending return.',
    created_at: '2025-09-25T14:00:00Z',
    updated_at: '2026-02-14T11:00:00Z',
  },
  {
    id: 6,
    asset_tag: 'PER-001',
    name: 'Logitech MX Master 3S',
    asset_type: 'Peripheral',
    category: 'Office Equipment',
    manufacturer: 'Logitech',
    model: 'MX Master 3S',
    serial_number: 'LOGI-MX3S-1204',
    purchase_date: '2025-02-11',
    purchase_cost: 99.99,
    status: 'Available',
    description: 'Quiet clicks, 8K DPI sensor, Bluetooth + Bolt.',
    specifications: 'Quiet clicks, 8K DPI sensor, Bluetooth + Bolt.',
    created_at: '2025-02-11T09:00:00Z',
    updated_at: '2025-02-11T09:00:00Z',
  },
  {
    id: 7,
    asset_tag: 'LIC-001',
    name: 'JetBrains All Products Pack',
    asset_type: 'Software License',
    category: 'Software & Tools',
    manufacturer: 'JetBrains',
    model: 'Enterprise Subscription (25 Seats)',
    serial_number: 'JB-LIC-2026-9901',
    license_key: 'JB-LIC-2026-9901',
    seat_quota: 25,
    renewal_date: '2026-12-31',
    expiration_date: '2027-01-15',
    purchase_date: '2026-01-01',
    purchase_cost: 779.00,
    status: 'Assigned',
    description: '1-Year Enterprise floating seats for IntelliJ, WebStorm, and PyCharm.',
    specifications: '1-Year Enterprise floating seats for IntelliJ, WebStorm, and PyCharm.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 8,
    asset_tag: 'LIC-002',
    name: 'GitHub Enterprise Cloud',
    asset_type: 'Software License',
    category: 'Software & Tools',
    manufacturer: 'GitHub / Microsoft',
    model: 'Cloud Enterprise (100 Seats)',
    serial_number: 'GH-ENT-8841-ORG-KEY',
    license_key: 'GH-ENT-8841-ORG-KEY',
    seat_quota: 100,
    renewal_date: '2026-11-01',
    expiration_date: '2026-11-30',
    purchase_date: '2025-11-01',
    purchase_cost: 2100.00,
    status: 'Available',
    description: '100 developer seat licenses including GitHub Copilot Enterprise and Advanced Security.',
    specifications: '100 developer seat licenses including GitHub Copilot Enterprise and Advanced Security.',
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-01T10:00:00Z',
  },
  {
    id: 9,
    asset_tag: 'LAP-003',
    name: 'Lenovo ThinkPad X1 Carbon Gen 11',
    asset_type: 'Laptop',
    category: 'IT Hardware',
    manufacturer: 'Lenovo',
    model: 'ThinkPad X1 Carbon',
    serial_number: 'PF-448821',
    purchase_date: '2024-02-10',
    purchase_cost: 1850.00,
    status: 'Retired',
    description: 'Motherboard water damage. Salvaged for components.',
    specifications: 'Motherboard water damage. Salvaged for components.',
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2025-11-20T16:00:00Z',
  },
];

let mockEmployees = [
  {
    id: 1,
    employee_code: 'EMP-1001',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@company.com',
    department: 'Engineering',
    designation: 'Senior Frontend Engineer',
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 2,
    employee_code: 'EMP-1002',
    name: 'Priya Sharma',
    email: 'priya.sharma@company.com',
    department: 'Engineering',
    designation: 'Full Stack Engineer',
    created_at: '2024-03-01T09:00:00Z',
  },
  {
    id: 3,
    employee_code: 'EMP-1003',
    name: 'Ananya Roy',
    email: 'ananya.roy@company.com',
    department: 'Product',
    designation: 'Product Manager',
    created_at: '2024-06-12T09:00:00Z',
  },
  {
    id: 4,
    employee_code: 'EMP-1004',
    name: 'Vikram Mehta',
    email: 'vikram.mehta@company.com',
    department: 'Design',
    designation: 'Lead UI/UX Designer',
    created_at: '2024-08-20T09:00:00Z',
  },
  {
    id: 5,
    employee_code: 'EMP-1005',
    name: 'Neha Gupta',
    email: 'neha.gupta@company.com',
    department: 'Human Resources',
    designation: 'HR Specialist',
    created_at: '2024-11-05T09:00:00Z',
  },
];

let mockAssignments = [
  {
    id: 1,
    asset_id: 1,
    employee_id: 1,
    assigned_at: '2025-03-15T14:30:00Z',
    returned_at: null,
    condition_at_assignment: 'Brand New',
    condition_at_return: null,
    notes: 'Primary workstation laptop assigned upon onboarding.',
  },
  {
    id: 2,
    asset_id: 3,
    employee_id: 4,
    assigned_at: '2025-02-01T08:00:00Z',
    returned_at: null,
    condition_at_assignment: 'Excellent',
    condition_at_return: null,
    notes: 'Secondary 4K display for design studio.',
  },
  {
    id: 3,
    asset_id: 5,
    employee_id: 2,
    assigned_at: '2025-10-01T11:00:00Z',
    returned_at: null,
    condition_at_assignment: 'Brand New',
    condition_at_return: null,
    notes: 'Mobile testing device.',
  },
  {
    id: 4,
    asset_id: 7,
    employee_id: 2,
    assigned_at: '2026-01-05T10:00:00Z',
    returned_at: null,
    condition_at_assignment: 'Brand New',
    condition_at_return: null,
    notes: 'IDE license.',
  },
  {
    id: 5,
    asset_id: 2,
    employee_id: 1,
    assigned_at: '2024-06-01T10:00:00Z',
    returned_at: '2025-03-14T17:00:00Z',
    condition_at_assignment: 'Brand New',
    condition_at_return: 'Good',
    notes: 'Temporary laptop prior to M3 upgrade. Returned in clean condition.',
  },
];

let mockAssetStatusHistory = [
  {
    id: 1,
    asset_id: 1,
    old_status: 'None',
    new_status: 'Available',
    changed_at: '2025-03-12T10:00:00Z',
    reason: 'Initial asset procurement',
  },
  {
    id: 2,
    asset_id: 1,
    old_status: 'Available',
    new_status: 'Assigned',
    changed_at: '2025-03-15T14:30:00Z',
    reason: 'Assigned to Rahul Kumar (EMP-1001)',
  },
  {
    id: 3,
    asset_id: 4,
    old_status: 'Available',
    new_status: 'In Repair',
    changed_at: '2026-01-10T15:20:00Z',
    reason: 'Service ticket #101: Display flickering',
  },
  {
    id: 4,
    asset_id: 5,
    old_status: 'Assigned',
    new_status: 'Return Requested',
    changed_at: '2026-02-14T11:00:00Z',
    reason: 'Employee requested return - project completed',
  },
];

let mockServiceRecords = [
  {
    id: 1,
    asset_id: 4,
    service_type: 'Screen Replacement',
    description: 'Display back-light inverter flickering intermittently.',
    service_date: '2026-01-10',
    completed_date: null,
    cost: 280.00,
    service_provider: 'LG Premier Service Center',
    status: 'OPEN',
    notes: 'Awaiting OEM replacement panel from supplier.',
  },
  {
    id: 2,
    asset_id: 2,
    service_type: 'Maintenance',
    description: 'Internal thermal paste refresh and fan cleaning.',
    service_date: '2025-11-05',
    completed_date: '2025-11-07',
    cost: 65.00,
    service_provider: 'In-House IT Support',
    status: 'COMPLETED',
    notes: 'Temperatures lowered by 12 deg C under load.',
  },
];

let mockReturnRequests = [
  {
    id: 1,
    asset_id: 5,
    employee_id: 2,
    assignment_id: 3,
    requested_at: '2026-02-14T11:00:00Z',
    status: 'PENDING',
    processed_at: null,
    notes: 'Mobile testing project completed. Returning device and cables.',
  },
];

// Helper to simulate network latency for realistic feel
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // Stats
  async getStats() {
    await delay();
    return {
      total_assets: mockAssets.length,
      available_assets: mockAssets.filter((a) => a.status.toLowerCase() === 'available').length,
      assigned_assets: mockAssets.filter((a) => a.status.toLowerCase() === 'assigned').length,
      in_repair_assets: mockAssets.filter((a) => a.status.toLowerCase() === 'in repair').length,
      return_requested_assets: mockAssets.filter((a) => a.status.toLowerCase() === 'return requested').length,
      retired_assets: mockAssets.filter((a) => a.status.toLowerCase() === 'retired').length,
      total_employees: mockEmployees.length,
      active_assignments: mockAssignments.filter((a) => !a.returned_at).length,
      pending_returns: mockReturnRequests.filter((r) => r.status.toUpperCase() === 'PENDING').length,
      open_services: mockServiceRecords.filter((s) => s.status.toUpperCase() === 'OPEN').length,
    };
  },

  // Assets
  async getAssets(params = {}) {
    await delay();
    let result = [...mockAssets];

    if (params.status) {
      result = result.filter((a) => a.status.toLowerCase() === params.status.toLowerCase());
    }
    if (params.asset_type) {
      result = result.filter((a) => a.asset_type.toLowerCase() === params.asset_type.toLowerCase());
    }
    if (params.category) {
      result = result.filter((a) => a.category && a.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.asset_tag.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.serial_number && a.serial_number.toLowerCase().includes(q)) ||
          (a.model && a.model.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => b.id - a.id);
  },

  async getAsset(id) {
    await delay();
    const asset = mockAssets.find((a) => a.id === Number(id));
    if (!asset) throw new Error('Asset not found.');
    return asset;
  },

  async getAssetHistory(assetId) {
    await delay();
    return mockAssetStatusHistory
      .filter((h) => h.asset_id === Number(assetId))
      .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));
  },

  async createAsset(data) {
    await delay();
    const exists = mockAssets.some(
      (a) => a.asset_tag.toLowerCase() === data.asset_tag.trim().toLowerCase()
    );
    if (exists) {
      throw new Error(`Asset tag '${data.asset_tag}' already exists.`);
    }

    const newId = mockAssets.length ? Math.max(...mockAssets.map((a) => a.id)) + 1 : 1;
    const now = new Date().toISOString();
    const newAsset = {
      id: newId,
      name: data.name || `${data.manufacturer || ''} ${data.model || ''}`.trim() || data.asset_type,
      ...data,
      status: data.status || 'Available',
      created_at: now,
      updated_at: now,
    };
    mockAssets.push(newAsset);

    mockAssetStatusHistory.push({
      id: mockAssetStatusHistory.length + 1,
      asset_id: newId,
      old_status: 'None',
      new_status: newAsset.status,
      changed_at: now,
      reason: 'Initial asset registration',
    });

    return newAsset;
  },

  async updateAsset(id, data) {
    await delay();
    const index = mockAssets.findIndex((a) => a.id === Number(id));
    if (index === -1) throw new Error('Asset not found.');

    const old = mockAssets[index];
    const now = new Date().toISOString();

    if (data.status && data.status !== old.status) {
      mockAssetStatusHistory.push({
        id: mockAssetStatusHistory.length + 1,
        asset_id: old.id,
        old_status: old.status,
        new_status: data.status,
        changed_at: now,
        reason: 'Asset status updated via UI',
      });
    }

    mockAssets[index] = {
      ...old,
      ...data,
      updated_at: now,
    };
    return mockAssets[index];
  },

  async deleteAsset(id) {
    await delay();
    const index = mockAssets.findIndex((a) => a.id === Number(id));
    if (index === -1) throw new Error('Asset not found.');
    mockAssets.splice(index, 1);
    return true;
  },

  // Employees
  async getEmployees(params = {}) {
    await delay();
    let result = [...mockEmployees];
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employee_code.toLowerCase().includes(q) ||
          (e.department && e.department.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => b.id - a.id);
  },

  async getEmployee(id) {
    await delay();
    const emp = mockEmployees.find((e) => e.id === Number(id));
    if (!emp) throw new Error('Employee not found.');
    return emp;
  },

  async createEmployee(data) {
    await delay();
    const exists = mockEmployees.some(
      (e) =>
        e.employee_code.toLowerCase() === data.employee_code.trim().toLowerCase() ||
        e.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (exists) throw new Error('Employee code or email already exists.');

    const newId = mockEmployees.length ? Math.max(...mockEmployees.map((e) => e.id)) + 1 : 1;
    const newEmp = {
      id: newId,
      ...data,
      created_at: new Date().toISOString(),
    };
    mockEmployees.push(newEmp);
    return newEmp;
  },

  async updateEmployee(id, data) {
    await delay();
    const index = mockEmployees.findIndex((e) => e.id === Number(id));
    if (index === -1) throw new Error('Employee not found.');
    mockEmployees[index] = { ...mockEmployees[index], ...data };
    return mockEmployees[index];
  },

  async deleteEmployee(id) {
    await delay();
    const index = mockEmployees.findIndex((e) => e.id === Number(id));
    if (index === -1) throw new Error('Employee not found.');
    mockEmployees.splice(index, 1);
    return true;
  },

  // Assignments
  async getAssignments(params = {}) {
    await delay();
    let result = [...mockAssignments];
    if (params.active_only) {
      result = result.filter((a) => !a.returned_at);
    }
    if (params.asset_id) {
      result = result.filter((a) => a.asset_id === Number(params.asset_id));
    }
    if (params.employee_id) {
      result = result.filter((a) => a.employee_id === Number(params.employee_id));
    }
    return result.sort((a, b) => b.id - a.id);
  },

  async createAssignment(data) {
    await delay();
    const asset = mockAssets.find((a) => a.id === Number(data.asset_id));
    if (!asset) throw new Error('Asset not found.');
    if (asset.status.toLowerCase() !== 'available') {
      throw new Error(`Asset '${asset.asset_tag}' is currently ${asset.status} and cannot be assigned.`);
    }

    const employee = mockEmployees.find((e) => e.id === Number(data.employee_id));
    if (!employee) throw new Error('Employee not found.');

    const now = new Date().toISOString();
    const newId = mockAssignments.length ? Math.max(...mockAssignments.map((a) => a.id)) + 1 : 1;
    const assignment = {
      id: newId,
      asset_id: asset.id,
      employee_id: employee.id,
      condition_at_assignment: data.condition_at_assignment || 'Good',
      notes: data.notes || '',
      assigned_at: now,
      returned_at: null,
    };
    mockAssignments.push(assignment);

    // Update asset
    const oldStatus = asset.status;
    asset.status = 'Assigned';
    asset.updated_at = now;

    mockAssetStatusHistory.push({
      id: mockAssetStatusHistory.length + 1,
      asset_id: asset.id,
      old_status: oldStatus,
      new_status: 'Assigned',
      changed_at: now,
      reason: `Assigned to ${employee.name} (${employee.employee_code})`,
    });

    return assignment;
  },

  async returnAssignment(assignmentId, data = {}) {
    await delay();
    const assignment = mockAssignments.find((a) => a.id === Number(assignmentId));
    if (!assignment) throw new Error('Assignment not found.');
    if (assignment.returned_at) throw new Error('This assignment has already been returned.');

    const now = new Date().toISOString();
    assignment.returned_at = now;
    if (data.condition_at_return) assignment.condition_at_return = data.condition_at_return;
    if (data.notes) assignment.notes = `${assignment.notes || ''}\nReturn notes: ${data.notes}`.trim();

    const asset = mockAssets.find((a) => a.id === assignment.asset_id);
    if (asset) {
      const oldStatus = asset.status;
      asset.status = 'Available';
      asset.updated_at = now;

      mockAssetStatusHistory.push({
        id: mockAssetStatusHistory.length + 1,
        asset_id: asset.id,
        old_status: oldStatus,
        new_status: 'Available',
        changed_at: now,
        reason: 'Asset returned from assignment',
      });
    }

    return assignment;
  },

  // Service Records
  async getServiceRecords(params = {}) {
    await delay();
    let result = [...mockServiceRecords];
    if (params.asset_id) {
      result = result.filter((s) => s.asset_id === Number(params.asset_id));
    }
    if (params.status) {
      result = result.filter((s) => s.status.toLowerCase() === params.status.toLowerCase());
    }
    return result.sort((a, b) => b.id - a.id);
  },

  async createServiceRecord(data) {
    await delay();
    const asset = mockAssets.find((a) => a.id === Number(data.asset_id));
    if (!asset) throw new Error('Asset not found.');

    const now = new Date().toISOString();
    const newId = mockServiceRecords.length ? Math.max(...mockServiceRecords.map((s) => s.id)) + 1 : 1;
    const record = {
      id: newId,
      ...data,
      cost: data.cost ? Number(data.cost) : null,
      status: data.status || 'OPEN',
    };
    mockServiceRecords.push(record);

    if (asset.status.toLowerCase() !== 'in repair') {
      const oldStatus = asset.status;
      asset.status = 'In Repair';
      asset.updated_at = now;

      mockAssetStatusHistory.push({
        id: mockAssetStatusHistory.length + 1,
        asset_id: asset.id,
        old_status: oldStatus,
        new_status: 'In Repair',
        changed_at: now,
        reason: `Maintenance service started: ${record.service_type}`,
      });
    }

    return record;
  },

  async updateServiceRecord(id, data, returnAssetToAvailable = false) {
    await delay();
    const index = mockServiceRecords.findIndex((s) => s.id === Number(id));
    if (index === -1) throw new Error('Service record not found.');

    mockServiceRecords[index] = { ...mockServiceRecords[index], ...data };
    const record = mockServiceRecords[index];

    if (returnAssetToAvailable || (data.status && data.status.toUpperCase() === 'COMPLETED')) {
      const asset = mockAssets.find((a) => a.id === record.asset_id);
      if (asset && asset.status.toLowerCase() === 'in repair') {
        const now = new Date().toISOString();
        asset.status = 'Available';
        asset.updated_at = now;

        mockAssetStatusHistory.push({
          id: mockAssetStatusHistory.length + 1,
          asset_id: asset.id,
          old_status: 'In Repair',
          new_status: 'Available',
          changed_at: now,
          reason: `Service completed: ${record.service_type}`,
        });
      }
    }

    return record;
  },

  // Return Requests
  async getReturnRequests() {
    await delay();
    return [...mockReturnRequests].sort((a, b) => b.id - a.id);
  },

  async createReturnRequest(data) {
    await delay();
    const now = new Date().toISOString();
    const newId = mockReturnRequests.length ? Math.max(...mockReturnRequests.map((r) => r.id)) + 1 : 1;
    const req = {
      id: newId,
      ...data,
      requested_at: now,
      status: 'PENDING',
      processed_at: null,
    };
    mockReturnRequests.push(req);

    const asset = mockAssets.find((a) => a.id === Number(data.asset_id));
    if (asset) {
      asset.status = 'Return Requested';
      asset.updated_at = now;

      mockAssetStatusHistory.push({
        id: mockAssetStatusHistory.length + 1,
        asset_id: asset.id,
        old_status: 'Assigned',
        new_status: 'Return Requested',
        changed_at: now,
        reason: 'Return request submitted by employee',
      });
    }
    return req;
  },

  async approveReturnRequest(id, condition = 'Good') {
    await delay();
    const req = mockReturnRequests.find((r) => r.id === Number(id));
    if (!req) throw new Error('Return request not found.');

    const now = new Date().toISOString();
    req.status = 'APPROVED';
    req.processed_at = now;

    // Complete assignment
    const assignment = mockAssignments.find((a) => a.id === req.assignment_id);
    if (assignment) {
      assignment.returned_at = now;
      assignment.condition_at_return = condition;
    }

    // Set asset to available
    const asset = mockAssets.find((a) => a.id === req.asset_id);
    if (asset) {
      asset.status = 'Available';
      asset.updated_at = now;

      mockAssetStatusHistory.push({
        id: mockAssetStatusHistory.length + 1,
        asset_id: asset.id,
        old_status: 'Return Requested',
        new_status: 'Available',
        changed_at: now,
        reason: 'Return request approved; asset returned to inventory',
      });
    }

    return req;
  },

  async rejectReturnRequest(id, reason = '') {
    await delay();
    const req = mockReturnRequests.find((r) => r.id === Number(id));
    if (!req) throw new Error('Return request not found.');

    const now = new Date().toISOString();
    req.status = 'REJECTED';
    req.processed_at = now;
    if (reason) req.notes = `${req.notes || ''}\nRejection reason: ${reason}`.trim();

    const asset = mockAssets.find((a) => a.id === req.asset_id);
    if (asset) {
      asset.status = 'Assigned';
      asset.updated_at = now;

      mockAssetStatusHistory.push({
        id: mockAssetStatusHistory.length + 1,
        asset_id: asset.id,
        old_status: 'Return Requested',
        new_status: 'Assigned',
        changed_at: now,
        reason: `Return request rejected: ${reason || 'Not approved'}`,
      });
    }
    return req;
  },
};
