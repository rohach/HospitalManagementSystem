// Billing.jsx
import React, { useEffect, useState } from "react";
import {
  getAllBillsForAdmin,
  getPatientBills,
  getInvoiceByBill,
  getAuditLogsByBill,
  createBill,
} from "../../../utils/api";
import { fetchData } from "../../../utils/api";
import "./billing.css";

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(false);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [billPatient, setBillPatient] = useState("");
  const [billItems, setBillItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const getPatientName = (patientId) => {
    const p = patients.find((x) => x._id === (patientId?._id || patientId));
    return p?.patientName || p?.name || p?.fullName || "Unknown";
  };

  const loadPatients = async () => {
    try {
      const res = await fetchData("patient/getAllPatients");
      setPatients(res?.patients || []);
    } catch (e) {
      console.error("Failed to load patients", e);
    }
  };

  const loadBills = async (patientId = "") => {
    setLoading(true);
    try {
      if (patientId) {
        const res = await getPatientBills(patientId);
        setBills(res?.bills || []);
      } else {
        const res = await getAllBillsForAdmin();
        setBills(res?.bills || []);
      }
    } catch (e) {
      console.error("Failed to load bills", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    loadBills();
  }, []);

  const handlePatientChange = (e) => {
    const id = e.target.value;
    setSelectedPatient(id);
    loadBills(id);
  };

  const handleViewInvoice = async (billId) => {
    try {
      const res = await getInvoiceByBill(billId);
      setInvoiceData(res?.invoice || null);
      setInvoiceModalOpen(true);
    } catch (e) {
      console.error("Failed to fetch invoice", e);
    }
  };

  const handleViewAuditLogs = async (billId) => {
    try {
      const res = await getAuditLogsByBill(billId);
      setAuditLogs(res?.logs || []);
      setAuditModalOpen(true);
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
    }
  };

  const closeInvoiceModal = () => {
    setInvoiceModalOpen(false);
    setInvoiceData(null);
  };

  const closeAuditModal = () => {
    setAuditModalOpen(false);
    setAuditLogs([]);
  };

  const formatCurrency = (n) =>
    typeof n === "number" ? n.toFixed(2) : Number(n || 0).toFixed(2);

  const handleAddItem = () => {
    setBillItems([
      ...billItems,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const items = [...billItems];
    items[index][field] = field === "description" ? value : parseFloat(value);
    setBillItems(items);
  };

  const handleRemoveItem = (index) => {
    const items = [...billItems];
    items.splice(index, 1);
    setBillItems(items);
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!billPatient || billItems.length === 0) return;

    try {
      const res = await createBill({ patient: billPatient, items: billItems });
      if (res?.success) {
        alert("Bill created successfully!");
        setCreateModalOpen(false);
        setBillPatient("");
        setBillItems([{ description: "", quantity: 1, unitPrice: 0 }]);
        loadBills(billPatient || "");
      }
    } catch (e) {
      console.error("Failed to create bill", e);
    }
  };

  return (
    <div className="billing-wrap">
      {/* Topbar */}
      <div className="billing-topbar">
        <h2 className="billing-title">
          <i className="fa-solid fa-file-invoice-dollar billing-icon"></i>
          Billing Management
        </h2>
        <div className="billing-filter">
          <label htmlFor="patientSelect" className="billing-label">
            Filter by Patient
          </label>
          <select
            id="patientSelect"
            className="billing-select"
            value={selectedPatient}
            onChange={handlePatientChange}
          >
            <option value="">All Patients...</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.patientName || p.name || p.fullName || "Unnamed"}
              </option>
            ))}
          </select>
          <button
            className="create-bill-btn"
            onClick={() => setCreateModalOpen(true)}
          >
            <i className="fa-solid fa-plus"></i> Create Bill
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="billing-loading">
          <p>Loading bills...</p>
          <div className="table-placeholder">
            <div className="row-placeholder"></div>
            <div className="row-placeholder"></div>
            <div className="row-placeholder"></div>
          </div>
        </div>
      ) : bills.length === 0 ? (
        <p className="billing-empty">No bills found.</p>
      ) : (
        <div className="billing-table-wrap">
          <table className="billing-table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Patient</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                {/* <th>Created</th> */}
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id}>
                  <td className="mono">{b._id}</td>
                  <td>{getPatientName(b.patient)}</td>
                  <td>${formatCurrency(b.totalAmount)}</td>
                  <td>${formatCurrency(b.paidAmount)}</td>
                  <td>${formatCurrency(b.balance)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        b.status === "paid"
                          ? "paid"
                          : b.status === "partial"
                          ? "partial"
                          : "unpaid"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  {/* <td>
                    {b.createdAt
                      ? new Date(b.createdAt).toLocaleDateString()
                      : "-"}
                  </td> */}
                  <td className="actions">
                    <span
                      className="action-chip chip-invoice"
                      onClick={() => handleViewInvoice(b._id)}
                    >
                      <i className="fa-solid fa-receipt"></i> Invoice
                    </span>
                    <span
                      className="action-chip chip-audit"
                      onClick={() => handleViewAuditLogs(b._id)}
                    >
                      <i className="fa-solid fa-clipboard-list"></i> Audit
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Create Bill Modal ===== */}
      {createModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close-btn"
              onClick={() => setCreateModalOpen(false)}
            >
              &times;
            </span>
            <h3>Create Bill</h3>
            <form onSubmit={handleCreateBill}>
              <label>
                Patient:
                <select
                  value={billPatient}
                  onChange={(e) => setBillPatient(e.target.value)}
                  required
                >
                  <option value="">Select a patient...</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.patientName || p.name || p.fullName || "Unnamed"}
                    </option>
                  ))}
                </select>
              </label>
              <div className="bill-items">
                {billItems.map((item, index) => (
                  <div key={index} className="bill-item">
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      min="1"
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      required
                    />
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      min="0"
                      step="0.01"
                      onChange={(e) =>
                        handleItemChange(index, "unitPrice", e.target.value)
                      }
                      required
                    />
                    {billItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleAddItem}>
                + Add Item
              </button>
              <button type="submit" className="submit-btn">
                Create Bill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== Invoice Modal ===== */}
      {invoiceModalOpen && invoiceData && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeInvoiceModal}>
              &times;
            </span>
            <h3>Invoice #{invoiceData.invoiceNumber}</h3>
            <p>Amount: ${formatCurrency(invoiceData.amount)}</p>
            <p>Status: {invoiceData.status}</p>
            <p>
              Created:{" "}
              {invoiceData.createdAt
                ? new Date(invoiceData.createdAt).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>
      )}

      {/* ===== Audit Logs Modal ===== */}
      {auditModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeAuditModal}>
              &times;
            </span>
            <h3>Audit Logs</h3>
            {auditLogs.length ? (
              <ul>
                {auditLogs.map((log) => (
                  <li key={log._id}>
                    {log.timestamp}: {log.action}{" "}
                    {log.details && `- ${log.details}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No audit logs found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
