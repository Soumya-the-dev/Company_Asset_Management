import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EmployeeTable from '../components/employees/EmployeeTable';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeDetails from '../components/employees/EmployeeDetails';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { employeeService } from '../services/employeeService';
import { assignmentService } from '../services/assignmentService';
import { assetService } from '../services/assetService';
import { DEPARTMENTS } from '../utils/constants';

const PAGE_SIZE = 10;

export default function Employees() {
  const { id: urlEmpId } = useParams();
  const { addToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [detailsEmployee, setDetailsEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empsData, assignsData, returnsData, assetsData] = await Promise.all([
        employeeService.getEmployees({
          search,
          department: selectedDept,
        }),
        assignmentService.getAssignments(),
        assignmentService.getReturnRequests(),
        assetService.getAssets({ limit: 200 }),
      ]);

      setEmployees(empsData || []);
      setAssignments(assignsData || []);
      setReturnRequests(returnsData || []);
      setAssets(assetsData || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to load employee directory.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedDept]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle direct navigation to /employees/:id
  useEffect(() => {
    if (urlEmpId) {
      employeeService
        .getEmployee(urlEmpId)
        .then((data) => {
          if (data) setDetailsEmployee(data);
        })
        .catch((err) => console.error('Error loading employee by ID param:', err));
    }
  }, [urlEmpId]);

  // Compute active assigned assets count per employee
  const assignedCountMap = new Map();
  assignments.forEach((a) => {
    if (!a.returned_at) {
      const current = assignedCountMap.get(a.employee_id) || 0;
      assignedCountMap.set(a.employee_id, current + 1);
    }
  });

  // Client-side pagination
  const totalItems = employees.length;
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Form Submit (Create / Edit)
  async function handleFormSubmit(payload) {
    setActionLoading(true);
    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, payload);
        addToast(`Employee '${payload.name}' updated successfully.`, 'success');
      } else {
        await employeeService.createEmployee(payload);
        addToast(`Employee '${payload.name}' registered successfully.`, 'success');
      }
      setFormOpen(false);
      setEditingEmployee(null);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  }

  // Delete Confirm
  async function handleDeleteConfirm() {
    if (!deletingEmployee) return;
    setActionLoading(true);
    try {
      await employeeService.deleteEmployee(deletingEmployee.id);
      addToast(`Employee '${deletingEmployee.name}' removed successfully.`, 'success');
      setDeletingEmployee(null);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to delete employee.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // Quick return handler from employee details
  async function handleReturnAssetFromDetails(item) {
    if (!item.assignmentId) return;
    setActionLoading(true);
    try {
      await assignmentService.returnAssignment(item.assignmentId, {
        condition_at_return: 'Good',
        notes: 'Returned from Employee Details profile',
      });
      addToast(`Asset ${item.asset_tag} returned to available inventory.`, 'success');
      setDetailsEmployee(null);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to return asset.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // Data helpers for Employee Details view
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const employeeAssignedAssets = detailsEmployee
    ? assignments
        .filter((a) => a.employee_id === detailsEmployee.id && !a.returned_at)
        .map((a) => {
          const asset = assetMap.get(a.asset_id);
          return {
            ...asset,
            assignmentId: a.id,
            assigned_at: a.assigned_at,
            condition_at_assignment: a.condition_at_assignment,
          };
        })
    : [];

  const employeeAssignmentHistory = detailsEmployee
    ? assignments
        .filter((a) => a.employee_id === detailsEmployee.id)
        .map((a) => {
          const asset = assetMap.get(a.asset_id);
          return {
            ...a,
            asset_tag: asset?.asset_tag,
            asset_name: asset?.name || asset?.asset_type,
          };
        })
    : [];

  const employeeReturnRequests = detailsEmployee
    ? returnRequests
        .filter((r) => r.employee_id === detailsEmployee.id)
        .map((r) => {
          const asset = assetMap.get(r.asset_id);
          return {
            ...r,
            asset_tag: asset?.asset_tag,
            asset_name: asset?.name || asset?.asset_type,
          };
        })
    : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Employee Directory</h1>
          <p>Manage employee records, organizational departments, and hardware custody</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            onClick={() => {
              setEditingEmployee(null);
              setFormOpen(true);
            }}
          >
            + Add Employee
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      <div className="table-card">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search employee, email, code..."
            />
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '150px', padding: '0.4rem 0.65rem', fontSize: '0.8125rem' }}
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by department"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {(search || selectedDept) && (
              <button
                type="button"
                className="btn btn-subtle btn-sm"
                onClick={() => {
                  setSearch('');
                  setSelectedDept('');
                  setCurrentPage(1);
                }}
                style={{ color: 'var(--danger)', fontWeight: 600 }}
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="table-toolbar-right">
            <Button variant="subtle" size="sm" onClick={loadData} title="Refresh Table">
              ↻ Refresh
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Loading text="Loading employee directory..." />
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description={
              search || selectedDept
                ? 'No employees match your search query or department filter.'
                : 'No employees have been added to the directory yet.'
            }
            actionText={search || selectedDept ? 'Clear Search' : 'Add First Employee'}
            onAction={
              search || selectedDept
                ? () => {
                    setSearch('');
                    setSelectedDept('');
                  }
                : () => setFormOpen(true)
            }
          />
        ) : (
          <>
            <EmployeeTable
              employees={paginatedEmployees}
              assignedCountMap={assignedCountMap}
              onView={(emp) => setDetailsEmployee(emp)}
              onEdit={(emp) => {
                setEditingEmployee(emp);
                setFormOpen(true);
              }}
              onDelete={(emp) => setDeletingEmployee(emp)}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              itemLabel="employees"
            />
          </>
        )}
      </div>

      {/* Employee Form (Add / Edit) */}
      <EmployeeForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingEmployee}
        loading={actionLoading}
      />

      {/* Employee Details Modal */}
      <EmployeeDetails
        employee={detailsEmployee}
        isOpen={!!detailsEmployee}
        onClose={() => setDetailsEmployee(null)}
        assignedAssets={employeeAssignedAssets}
        assignmentHistory={employeeAssignmentHistory}
        returnRequests={employeeReturnRequests}
        onReturnAssetClick={handleReturnAssetFromDetails}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Employee: ${deletingEmployee?.name}`}
        message={`Are you sure you want to remove ${deletingEmployee?.name} (${deletingEmployee?.employee_code})? Any assigned assets should be returned first.`}
        confirmText="Remove Employee"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
