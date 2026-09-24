import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { SERVICE_TYPES, SERVICE_STATUSES } from '../../utils/constants';
import { validateServiceRecord } from '../../utils/validators';

const initialForm = {
  asset_id: '',
  service_type: 'Repair',
  description: '',
  service_provider: '',
  service_date: new Date().toISOString().split('T')[0],
  completed_date: '',
  cost: '',
  status: 'OPEN',
  notes: '',
};

export default function ServiceForm({
  isOpen,
  onClose,
  onSubmit,
  assets = [],
  initialData = null,
  preselectedAssetId = null,
  loading = false,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setFormData({
        asset_id: String(initialData.asset_id || ''),
        service_type: initialData.service_type || 'Repair',
        description: initialData.description || '',
        service_provider: initialData.service_provider || '',
        service_date: initialData.service_date || '',
        completed_date: initialData.completed_date || '',
        cost: initialData.cost !== null && initialData.cost !== undefined ? initialData.cost : '',
        status: initialData.status || 'OPEN',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        ...initialForm,
        asset_id: preselectedAssetId ? String(preselectedAssetId) : assets.length ? String(assets[0].id) : '',
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen, preselectedAssetId, assets]);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    const { isValid, errors: validationErrors } = validateServiceRecord(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit({
        asset_id: Number(formData.asset_id),
        service_type: formData.service_type,
        description: formData.description,
        service_provider: formData.service_provider,
        service_date: formData.service_date,
        completed_date: formData.completed_date || null,
        cost: formData.cost ? Number(formData.cost) : null,
        status: formData.status,
        notes: formData.notes,
      });
    } catch (err) {
      setServerError(err.message || 'Failed to save maintenance ticket.');
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={isEditing ? `Edit Service Ticket #${initialData.id}` : 'Create Maintenance Ticket'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEditing ? 'Save Changes' : 'Submit Ticket'}
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
          <label className="form-label" htmlFor="srv_asset">
            Asset Under Maintenance <span className="required">*</span>
          </label>
          <select
            id="srv_asset"
            className={`form-select ${errors.asset_id ? 'has-error' : ''}`}
            value={formData.asset_id}
            onChange={(e) => handleChange('asset_id', e.target.value)}
            disabled={isEditing}
          >
            <option value="">-- Select asset to service --</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.asset_tag} — {asset.name || asset.model || asset.asset_type} ({asset.status})
              </option>
            ))}
          </select>
          {errors.asset_id && <span className="form-error">{errors.asset_id}</span>}
          {!isEditing && (
            <span className="form-helper">
              Submitting will automatically transition asset status to "In Repair".
            </span>
          )}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="srv_type">
              Service Type <span className="required">*</span>
            </label>
            <select
              id="srv_type"
              className={`form-select ${errors.service_type ? 'has-error' : ''}`}
              value={formData.service_type}
              onChange={(e) => handleChange('service_type', e.target.value)}
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.service_type && <span className="form-error">{errors.service_type}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="srv_vendor">
              Vendor / Service Provider
            </label>
            <input
              id="srv_vendor"
              type="text"
              className="form-input"
              placeholder="e.g. Dell Support, AppleCare, In-House"
              value={formData.service_provider}
              onChange={(e) => handleChange('service_provider', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="srv_desc">
            Issue Description & Diagnostics <span className="required">*</span>
          </label>
          <textarea
            id="srv_desc"
            rows="3"
            className={`form-textarea ${errors.description ? 'has-error' : ''}`}
            placeholder="Describe the hardware issue, error message, or routine maintenance procedure required..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label" htmlFor="srv_date">
              Service Date <span className="required">*</span>
            </label>
            <input
              id="srv_date"
              type="date"
              className={`form-input ${errors.service_date ? 'has-error' : ''}`}
              value={formData.service_date}
              onChange={(e) => handleChange('service_date', e.target.value)}
            />
            {errors.service_date && <span className="form-error">{errors.service_date}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="srv_cost">
              Cost (USD)
            </label>
            <input
              id="srv_cost"
              type="number"
              step="0.01"
              min="0"
              className={`form-input ${errors.cost ? 'has-error' : ''}`}
              placeholder="0.00"
              value={formData.cost}
              onChange={(e) => handleChange('cost', e.target.value)}
            />
            {errors.cost && <span className="form-error">{errors.cost}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="srv_status">
              Ticket Status
            </label>
            <select
              id="srv_status"
              className="form-select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {SERVICE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isEditing && (
          <div className="form-group">
            <label className="form-label" htmlFor="srv_completed">
              Resolution Date
            </label>
            <input
              id="srv_completed"
              type="date"
              className="form-input"
              value={formData.completed_date}
              onChange={(e) => handleChange('completed_date', e.target.value)}
            />
            <span className="form-helper">
              Setting status to COMPLETED will allow returning asset to Available inventory.
            </span>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="srv_notes">
            Resolution Notes
          </label>
          <textarea
            id="srv_notes"
            rows="2"
            className="form-textarea"
            placeholder="Parts replaced, RMA tracking numbers, technician notes..."
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
