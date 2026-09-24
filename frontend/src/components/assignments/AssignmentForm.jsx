import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { CONDITION_OPTIONS } from '../../utils/constants';
import { validateAssignment } from '../../utils/validators';

const initialForm = {
  asset_id: '',
  employee_id: '',
  checkout_date: new Date().toISOString().split('T')[0],
  condition_at_assignment: 'Good',
  notes: '',
};

export default function AssignmentForm({
  isOpen,
  onClose,
  onSubmit,
  availableAssets = [],
  employees = [],
  preselectedAssetId = null,
  loading = false,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        asset_id: preselectedAssetId ? String(preselectedAssetId) : '',
        employee_id: employees.length ? String(employees[0].id) : '',
        checkout_date: new Date().toISOString().split('T')[0],
        condition_at_assignment: 'Good',
        notes: '',
      });
      setErrors({});
      setServerError(null);
    }
  }, [isOpen, preselectedAssetId, employees]);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    const { isValid, errors: validationErrors } = validateAssignment(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit({
        asset_id: Number(formData.asset_id),
        employee_id: Number(formData.employee_id),
        assigned_at: formData.checkout_date ? new Date(formData.checkout_date).toISOString() : undefined,
        condition_at_assignment: formData.condition_at_assignment,
        notes: formData.notes,
      });
    } catch (err) {
      setServerError(err.message || 'Failed to assign asset.');
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title="Assign Asset to Employee"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={availableAssets.length === 0 || employees.length === 0}
          >
            Assign Asset
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

        {availableAssets.length === 0 && (
          <div
            className="error-alert"
            style={{
              background: 'var(--warning-bg)',
              borderColor: 'var(--warning-border)',
              color: 'var(--warning-text)',
              marginBottom: '1.25rem',
            }}
          >
            <span>⚠️ No assets are currently in "Available" status for assignment.</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="assign_asset">
            Select Asset (Available Inventory) <span className="required">*</span>
          </label>
          <select
            id="assign_asset"
            className={`form-select ${errors.asset_id ? 'has-error' : ''}`}
            value={formData.asset_id}
            onChange={(e) => handleChange('asset_id', e.target.value)}
          >
            <option value="">-- Choose an available asset --</option>
            {availableAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.asset_tag} — {asset.name || asset.model || asset.asset_type} ({asset.asset_type})
              </option>
            ))}
          </select>
          {errors.asset_id && <span className="form-error">{errors.asset_id}</span>}
          <span className="form-helper">Only assets with "Available" status can be assigned.</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="assign_employee">
            Select Custodian Employee <span className="required">*</span>
          </label>
          <select
            id="assign_employee"
            className={`form-select ${errors.employee_id ? 'has-error' : ''}`}
            value={formData.employee_id}
            onChange={(e) => handleChange('employee_id', e.target.value)}
          >
            <option value="">-- Select employee recipient --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employee_code}) • {emp.department || 'General'}
              </option>
            ))}
          </select>
          {errors.employee_id && <span className="form-error">{errors.employee_id}</span>}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="checkout_date">
              Checkout Date
            </label>
            <input
              id="checkout_date"
              type="date"
              className="form-input"
              value={formData.checkout_date}
              onChange={(e) => handleChange('checkout_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="assign_condition">
              Physical Condition at Checkout
            </label>
            <select
              id="assign_condition"
              className="form-select"
              value={formData.condition_at_assignment}
              onChange={(e) => handleChange('condition_at_assignment', e.target.value)}
            >
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="assign_notes">
            Checkout Notes / Purpose
          </label>
          <textarea
            id="assign_notes"
            rows="3"
            className="form-textarea"
            placeholder="e.g. Issued for remote development, includes power brick and USB-C adapter."
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
