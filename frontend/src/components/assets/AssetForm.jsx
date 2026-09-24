import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ASSET_TYPES, ASSET_STATUSES, ASSET_CATEGORIES } from '../../utils/constants';
import { validateAsset } from '../../utils/validators';

const initialForm = {
  asset_tag: '',
  name: '',
  asset_type: 'Laptop',
  category: 'IT Hardware',
  manufacturer: '',
  model: '',
  serial_number: '',
  purchase_date: '',
  purchase_cost: '',
  warranty_expiry: '',
  license_key: '',
  seat_quota: '',
  renewal_date: '',
  expiration_date: '',
  status: 'Available',
  description: '',
  specifications: '',
};

export default function AssetForm({
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
  const isSoftwareLicense = formData.asset_type === 'Software License';

  useEffect(() => {
    if (initialData) {
      setFormData({
        asset_tag: initialData.asset_tag || '',
        name: initialData.name || '',
        asset_type: initialData.asset_type || 'Laptop',
        category: initialData.category || (initialData.asset_type === 'Software License' ? 'Software & Tools' : 'IT Hardware'),
        manufacturer: initialData.manufacturer || '',
        model: initialData.model || '',
        serial_number: initialData.serial_number || '',
        purchase_date: initialData.purchase_date || '',
        purchase_cost:
          initialData.purchase_cost !== undefined && initialData.purchase_cost !== null
            ? initialData.purchase_cost
            : '',
        warranty_expiry: initialData.warranty_expiry || '',
        license_key: initialData.license_key || (initialData.asset_type === 'Software License' ? initialData.serial_number || '' : ''),
        seat_quota: initialData.seat_quota || initialData.seat_count || '',
        renewal_date: initialData.renewal_date || '',
        expiration_date: initialData.expiration_date || '',
        status: initialData.status || 'Available',
        description: initialData.description || initialData.specifications || '',
        specifications: initialData.specifications || initialData.description || '',
      });
    } else {
      setFormData(initialForm);
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen]);

  function handleChange(field, value) {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Convenience auto-category if software license is picked
      if (field === 'asset_type' && value === 'Software License' && prev.category === 'IT Hardware') {
        updated.category = 'Software & Tools';
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    const { isValid, errors: validationErrors } = validateAsset(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Build normalized payload compatible with FastAPI schema while storing license metadata
      const serialNumberValue = isSoftwareLicense
        ? formData.license_key || formData.serial_number || null
        : formData.serial_number || null;

      const modelValue = isSoftwareLicense && formData.seat_quota
        ? (formData.model ? `${formData.model} (${formData.seat_quota} Seats)` : `${formData.seat_quota} Seats Quota`)
        : formData.model || null;

      const licenseDetails = isSoftwareLicense
        ? `\n[License Key: ${formData.license_key || 'N/A'} | Quota: ${formData.seat_quota || '1'} Seats | Renewal: ${formData.renewal_date || 'N/A'} | Expiration: ${formData.expiration_date || 'N/A'}]`
        : '';

      const payload = {
        ...formData,
        serial_number: serialNumberValue,
        model: modelValue,
        purchase_cost: formData.purchase_cost ? Number(formData.purchase_cost) : null,
        purchase_date: formData.purchase_date || null,
        warranty_expiry: formData.warranty_expiry || null,
        license_key: formData.license_key || null,
        seat_quota: formData.seat_quota ? Number(formData.seat_quota) : null,
        renewal_date: formData.renewal_date || null,
        expiration_date: formData.expiration_date || null,
        description: `${formData.description || ''}${licenseDetails}`.trim(),
        specifications: `${formData.description || ''}${licenseDetails}`.trim(),
      };

      await onSubmit(payload);
    } catch (err) {
      setServerError(err.message || 'Failed to save asset.');
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={isEditing ? `Edit Asset: ${formData.asset_tag}` : 'Register New Asset'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Asset'}
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

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="asset_tag">
              Asset Tag <span className="required">*</span>
            </label>
            <input
              id="asset_tag"
              type="text"
              className={`form-input ${errors.asset_tag ? 'has-error' : ''}`}
              placeholder="e.g. LAP-001 or LIC-001"
              value={formData.asset_tag}
              onChange={(e) => handleChange('asset_tag', e.target.value.toUpperCase())}
              disabled={isEditing}
            />
            {errors.asset_tag && <span className="form-error">{errors.asset_tag}</span>}
            <span className="form-helper">Unique company inventory barcode / asset tag</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="asset_type">
              Asset Type <span className="required">*</span>
            </label>
            <select
              id="asset_type"
              className={`form-select ${errors.asset_type ? 'has-error' : ''}`}
              value={formData.asset_type}
              onChange={(e) => handleChange('asset_type', e.target.value)}
            >
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.asset_type && <span className="form-error">{errors.asset_type}</span>}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Asset Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder={isSoftwareLicense ? 'e.g. GitHub Enterprise Cloud' : 'e.g. MacBook Pro 16-inch M3'}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <span className="form-helper">Descriptive product or hardware title</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="form-select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {ASSET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Software License Specific Fields */}
        {isSoftwareLicense ? (
          <div
            style={{
              background: 'var(--primary-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🔑</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Software License Quota & Key Settings
              </strong>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="license_key">
                  License Key / Activation Code
                </label>
                <input
                  id="license_key"
                  type="text"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  className="form-input"
                  placeholder="e.g. GH-ENT-9941-ORG-KEY"
                  value={formData.license_key}
                  onChange={(e) => handleChange('license_key', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="seat_quota">
                  Seat Quota (Total Allowed Users)
                </label>
                <input
                  id="seat_quota"
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 50"
                  value={formData.seat_quota}
                  onChange={(e) => handleChange('seat_quota', e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="renewal_date">
                  Renewal Date
                </label>
                <input
                  id="renewal_date"
                  type="date"
                  className="form-input"
                  value={formData.renewal_date}
                  onChange={(e) => handleChange('renewal_date', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="expiration_date">
                  Expiration Date
                </label>
                <input
                  id="expiration_date"
                  type="date"
                  className="form-input"
                  value={formData.expiration_date}
                  onChange={(e) => handleChange('expiration_date', e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Hardware Specific Fields */
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="manufacturer">
                Brand / Manufacturer
              </label>
              <input
                id="manufacturer"
                type="text"
                className="form-input"
                placeholder="e.g. Apple, Dell, Lenovo"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="model">
                Model
              </label>
              <input
                id="model"
                type="text"
                className="form-input"
                placeholder="e.g. XPS 15 9530"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="serial_number">
                Serial Number
              </label>
              <input
                id="serial_number"
                type="text"
                className="form-input"
                placeholder="e.g. C02G4589MD6R"
                value={formData.serial_number}
                onChange={(e) => handleChange('serial_number', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="purchase_date">
              Purchase Date
            </label>
            <input
              id="purchase_date"
              type="date"
              className="form-input"
              value={formData.purchase_date}
              onChange={(e) => handleChange('purchase_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="purchase_cost">
              Purchase Cost (USD)
            </label>
            <input
              id="purchase_cost"
              type="number"
              step="0.01"
              min="0"
              className={`form-input ${errors.purchase_cost ? 'has-error' : ''}`}
              placeholder="e.g. 1999.00"
              value={formData.purchase_cost}
              onChange={(e) => handleChange('purchase_cost', e.target.value)}
            />
            {errors.purchase_cost && <span className="form-error">{errors.purchase_cost}</span>}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="warranty_expiry">
              Warranty Expiry Date
            </label>
            <input
              id="warranty_expiry"
              type="date"
              className="form-input"
              value={formData.warranty_expiry}
              onChange={(e) => handleChange('warranty_expiry', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="form-select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {ASSET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="description">
            Specifications & Notes
          </label>
          <textarea
            id="description"
            rows="3"
            className="form-textarea"
            placeholder={
              isSoftwareLicense
                ? 'e.g. Assigned to engineering department for CI/CD runners and GitHub actions.'
                : 'e.g. 32GB RAM, 1TB SSD, Space Black. Include any accessories or warranty notes.'
            }
            value={formData.description}
            onChange={(e) => {
              handleChange('description', e.target.value);
              handleChange('specifications', e.target.value);
            }}
          />
        </div>
      </form>
    </Modal>
  );
}
