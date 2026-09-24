import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { DEPARTMENTS } from '../../utils/constants';
import { validateEmployee } from '../../utils/validators';

const initialForm = {
  employee_code: '',
  name: '',
  email: '',
  phone: '',
  department: 'Engineering',
  designation: '',
};

export default function EmployeeForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setFormData({
        employee_code: initialData.employee_code || '',
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || 'Engineering',
        designation: initialData.designation || '',
      });
    } else {
      setFormData(initialForm);
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen]);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    const { isValid, errors: validationErrors } = validateEmployee(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setServerError(err.message || 'Failed to save employee.');
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={isEditing ? `Edit Employee: ${formData.name}` : 'Add New Employee'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEditing ? 'Save Changes' : 'Add Employee'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="error-alert" style={{ marginBottom: '1.25rem' }}>
            <span>⚠️ {serverError}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="employee_code">
            Employee ID / Code <span className="required">*</span>
          </label>
          <input
            id="employee_code"
            type="text"
            className={`form-input ${errors.employee_code ? 'has-error' : ''}`}
            placeholder="e.g. EMP-1001"
            value={formData.employee_code}
            onChange={(e) => handleChange('employee_code', e.target.value.toUpperCase())}
            disabled={isEditing}
          />
          {errors.employee_code && <span className="form-error">{errors.employee_code}</span>}
          <span className="form-helper">Unique organizational employee identifier</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="emp_name">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="emp_name"
            type="text"
            className={`form-input ${errors.name ? 'has-error' : ''}`}
            placeholder="e.g. Rahul Kumar"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="emp_email">
              Company Email Address <span className="required">*</span>
            </label>
            <input
              id="emp_email"
              type="email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              placeholder="e.g. rahul.kumar@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emp_phone">
              Contact Phone
            </label>
            <input
              id="emp_phone"
              type="tel"
              className="form-input"
              placeholder="e.g. +1 (555) 234-5678"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="emp_dept">
              Department
            </label>
            <select
              id="emp_dept"
              className="form-select"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emp_desig">
              Designation / Role
            </label>
            <input
              id="emp_desig"
              type="text"
              className="form-input"
              placeholder="e.g. Frontend Engineer"
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
