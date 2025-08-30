// PatientBilling.jsx
import React, { useEffect, useState } from "react";
import {
  getPatientBills,
  addPayment,
  getInvoiceByBill,
  getAuditLogsByBill,
} from "../../../utils/api";
import "./patientBilling.css";

const PatientBilling = ({ userData }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Load patient bills
  const loadBills = async () => {
    if (!userData?._id) return;

    try {
      setLoading(true);
      const res = await getPatientBills(userData._id);
      if (res?.success) setBills(res.bills || []);
    } catch (error) {
      console.error("Failed to load bills", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [userData]);

  const handlePayClick = (bill) => {
    setPayingBill(bill);
    setPaymentAmount("");
    setPaymentMethod("");
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentAmount || !paymentMethod) return;

    try {
      const res = await addPayment(payingBill._id, {
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
      });
      if (res?.success) {
        alert("Payment successful!");
        setPayingBill(null);
        loadBills();
      }
    } catch (error) {
      console.error("Payment failed", error);
    }
  };

  const handleViewInvoice = async (billId) => {
    try {
      const res = await getInvoiceByBill(billId);
      if (res?.success) {
        setInvoice(res.invoice);
        setShowInvoice(true);
      }
    } catch (error) {
      console.error("Failed to load invoice", error);
    }
  };

  const handleViewAuditLogs = async (billId) => {
    try {
      const res = await getAuditLogsByBill(billId);
      if (res?.success) {
        setAuditLogs(res.logs || []);
        setShowAuditLogs(true);
      }
    } catch (error) {
      console.error("Failed to load audit logs", error);
    }
  };

  if (loading) return <p className="loading-text">Loading bills...</p>;

  return (
    <div className="billing-container">
      <h2>My Bills</h2>
      {bills.length === 0 ? (
        <p>No bills found.</p>
      ) : (
        <table className="billing-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill._id}>
                <td>{bill._id}</td>
                <td>{bill.totalAmount}</td>
                <td>{bill.paidAmount}</td>
                <td>{bill.balance}</td>
                <td>{bill.status}</td>
                <td>
                  {bill.balance > 0 && (
                    <button
                      className="pay-btn"
                      onClick={() => handlePayClick(bill)}
                    >
                      Pay Bill
                    </button>
                  )}
                  <button
                    className="invoice-btn"
                    onClick={() => handleViewInvoice(bill._id)}
                  >
                    View Invoice
                  </button>
                  <button
                    className="audit-btn"
                    onClick={() => handleViewAuditLogs(bill._id)}
                  >
                    Audit Logs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Payment Modal */}
      {payingBill && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setPayingBill(null)}>
              &times;
            </span>
            <h3>Pay Bill: {payingBill._id}</h3>
            <form onSubmit={handlePaymentSubmit}>
              <label>
                Amount:
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={payingBill.balance}
                  required
                />
              </label>
              <label>
                Method:
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="">Select method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                </select>
              </label>
              <button type="submit" className="submit-btn">
                Submit Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && invoice && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setShowInvoice(false)}>
              &times;
            </span>
            <h3>Invoice: {invoice.invoiceNumber}</h3>
            <p>Amount: {invoice.amount}</p>
            <p>Status: {invoice.status}</p>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {showAuditLogs && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setShowAuditLogs(false)}>
              &times;
            </span>
            <h3>Audit Logs</h3>
            {auditLogs.length === 0 ? (
              <p>No audit logs found.</p>
            ) : (
              <ul>
                {auditLogs.map((log) => (
                  <li key={log._id}>
                    {log.timestamp}: {log.action} - {log.details || log.amount}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientBilling;
