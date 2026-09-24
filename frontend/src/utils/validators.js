/**
 * Form field validator helpers
 */

export function isValidEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validateAsset(data) {
  const errors = {};

  if (!data.asset_tag || !data.asset_tag.trim()) {
    errors.asset_tag = 'Asset tag is required (e.g. LAP-001).';
  } else if (data.asset_tag.length > 50) {
    errors.asset_tag = 'Asset tag must be 50 characters or less.';
  }

  if (!data.asset_type || !data.asset_type.trim()) {
    errors.asset_type = 'Asset type is required.';
  }

  if (data.purchase_cost !== undefined && data.purchase_cost !== null && data.purchase_cost !== '') {
    if (isNaN(Number(data.purchase_cost)) || Number(data.purchase_cost) < 0) {
      errors.purchase_cost = 'Purchase cost must be a positive number.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateEmployee(data) {
  const errors = {};

  if (!data.employee_code || !data.employee_code.trim()) {
    errors.employee_code = 'Employee code/ID is required.';
  }

  if (!data.name || !data.name.trim()) {
    errors.name = 'Full name is required.';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAssignment(data) {
  const errors = {};

  if (!data.asset_id) {
    errors.asset_id = 'Please select an available asset to assign.';
  }

  if (!data.employee_id) {
    errors.employee_id = 'Please select an employee.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateServiceRecord(data) {
  const errors = {};

  if (!data.asset_id) {
    errors.asset_id = 'Please select an asset.';
  }

  if (!data.service_type || !data.service_type.trim()) {
    errors.service_type = 'Service type is required.';
  }

  if (!data.description || !data.description.trim()) {
    errors.description = 'Please describe the issue or service needed.';
  }

  if (!data.service_date) {
    errors.service_date = 'Service date is required.';
  }

  if (data.cost !== undefined && data.cost !== null && data.cost !== '') {
    if (isNaN(Number(data.cost)) || Number(data.cost) < 0) {
      errors.cost = 'Cost must be a positive number.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
