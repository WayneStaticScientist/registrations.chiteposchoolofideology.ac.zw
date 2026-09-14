"use client";

import React, { useEffect, useState } from "react";
import { Users, Briefcase, Plus, Search } from "lucide-react";
import { Spinner } from "@heroui/spinner";
import api from "@/services/api";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "lecturer",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/users/admin/employees");
      if (res.data?.data) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/users/admin/employees", formData);
      setSuccess("Employee created successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "lecturer",
      });
      fetchEmployees(); // Refresh list
      setTimeout(() => setShowForm(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">
            Staff & Roles
          </h1>
          <p className="text-zinc-500">
            Manage your administrators and lecturers.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg"
        >
          <Plus size={20} /> {showForm ? "Cancel" : "Add Staff"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <h3 className="text-xl font-bold">Register New Employee</h3>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 font-medium text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">First Name</label>
                <input
                  type="text"
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Last Name</label>
                <input
                  type="text"
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Email Address</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-zinc-700">System Role</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === 'admin' ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'}`}>
                    <input type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={handleInputChange} className="w-5 h-5 accent-emerald-600" />
                    <div>
                      <p className="font-bold text-zinc-900">Administrator</p>
                      <p className="text-xs text-zinc-500">Full access to dashboard</p>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === 'lecturer' ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'}`}>
                    <input type="radio" name="role" value="lecturer" checked={formData.role === 'lecturer'} onChange={handleInputChange} className="w-5 h-5 accent-emerald-600" />
                    <div>
                      <p className="font-bold text-zinc-900">Lecturer</p>
                      <p className="text-xs text-zinc-500">Access to course management</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? "Processing..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employees List */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="font-bold text-lg text-zinc-800">Current Directory</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Search staff..." 
              className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No employees found. Add your first staff member above.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center uppercase">
                          {emp.firstName?.[0] || ""}{emp.lastName?.[0] || ""}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900">{emp.firstName} {emp.lastName}</div>
                          <div className="text-xs text-zinc-500">Joined {new Date(emp.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-700">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                        emp.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-zinc-400 hover:text-zinc-600 font-medium text-sm">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
