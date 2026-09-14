"use client";

import React, { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { Eye, CheckCircle, XCircle, User, MapPin, Phone, Mail } from "lucide-react";
import { CertificateOfferModal } from "../../components/CertificateOfferModal";

interface Enrollment {
  _id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  countryOfResidence: string;
  city: string;
  birthCity: string;
  status: string;
  createdAt: string;
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch("http://localhost:9991/api/v1/enrollments");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setEnrollments(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch enrollments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:9991/api/v1/enrollments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        // Refresh
        await fetchEnrollments();
        if (selectedEnrollment && selectedEnrollment._id === id) {
           setSelectedEnrollment(null); // Close modal
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "accepted":
      case "registered":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">
          Enrollments
        </h1>
        <p className="text-zinc-500">
          Review and manage student applications.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">National ID</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date Applied</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No enrollments found.</td>
                </tr>
              ) : (
                enrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">{enrollment.firstName} {enrollment.lastName}</div>
                      <div className="text-sm text-zinc-500">{enrollment.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 font-medium">{enrollment.nationalId}</td>
                    <td className="px-6 py-4 text-zinc-500 text-sm">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedEnrollment(enrollment)}
                          className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                        {(enrollment.status === 'accepted' || enrollment.status === 'registered') && (
                          <button 
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setShowCertificateModal(true);
                            }}
                            className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Offer Certificate"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h2 className="text-xl font-bold text-zinc-900">Applicant Details</h2>
              <button 
                onClick={() => setSelectedEnrollment(null)}
                className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-300 hover:text-zinc-700 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <User size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Full Name</span>
                  </div>
                  <p className="font-bold text-zinc-900 text-lg">{selectedEnrollment.firstName} {selectedEnrollment.lastName}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <MapPin size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                  </div>
                  <p className="font-bold text-zinc-900">{selectedEnrollment.city}, {selectedEnrollment.countryOfResidence}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Phone size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Phone</span>
                  </div>
                  <p className="font-bold text-zinc-900">{selectedEnrollment.phoneNumber}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <User size={16} /> <span className="text-xs font-bold uppercase tracking-wider">National ID</span>
                  </div>
                  <p className="font-bold text-zinc-900">{selectedEnrollment.nationalId}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 flex justify-end gap-4">
                {selectedEnrollment.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(selectedEnrollment._id, 'rejected')}
                      disabled={isUpdating}
                      className="px-6 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={20} /> Decline
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedEnrollment._id, 'accepted')}
                      disabled={isUpdating}
                      className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
                    >
                      <CheckCircle size={20} /> Accept & Verify
                    </button>
                  </>
                ) : selectedEnrollment.status === 'accepted' || selectedEnrollment.status === 'registered' ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowCertificateModal(true)}
                      className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700 transition-colors"
                    >
                      Offer Certificate
                    </button>
                    <div className="flex-1 py-3 bg-zinc-100 text-zinc-500 font-bold rounded-xl text-center">
                      Status: <span className="uppercase">{selectedEnrollment.status}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full py-3 bg-zinc-100 text-zinc-500 font-bold rounded-xl text-center">
                    Status: <span className="uppercase">{selectedEnrollment.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCertificateModal && selectedEnrollment && (
        <CertificateOfferModal
          enrollmentId={selectedEnrollment._id}
          studentName={`${selectedEnrollment.firstName} ${selectedEnrollment.lastName}`}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
}
