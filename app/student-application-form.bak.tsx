"use client";
import React, { useState } from "react";
import {
  User,
  MapPin,
  Calendar,
  FileText,
  Upload,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";

const App = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    email: "",
    phoneNumber: "",
    city: "",
    country: "",
    nationality: "",
    homeAddress: "",
    dob: "",
    gender: "",
    oLevelDocs: null,
    aLevelDocs: null,
    nationalIdDocs: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: any, field: any) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file.name }));
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  const StepIndicator = () => (
    <div className="flex justify-between mb-8 max-w-md mx-auto relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 -translate-y-1/2 z-0"></div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            step >= i
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
              : "bg-white text-zinc-400 border-2 border-zinc-200"
          }`}
        >
          {step > i ? <CheckCircle size={20} /> : i}
        </div>
      ))}
    </div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">
            Application Submitted!
          </h1>
          <p className="text-zinc-600 mb-8">
            Thank you,{" "}
            <span className="font-semibold text-emerald-600">
              {formData.fullName}
            </span>
            . Your application at Chitepo School of Ideology is being processed.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 font-sans selection:bg-emerald-100">
      {/* Header Section */}
      <header className="bg-white border-b border-zinc-100 py-6 px-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg ">
              <Image
                src={"/apple-touch-icon.png"}
                width={30}
                height={30}
                alt={"logo"}
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase">
                Chitepo School
              </h1>
              <p className="text-xs text-emerald-600 font-bold tracking-widest uppercase">
                Of Ideology
              </p>
            </div>
          </div>
          <div className="px-4 py-1.5 bg-zinc-100 rounded-full text-sm font-medium text-zinc-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Enrollment Open: #DecolonizingTheMind
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Intro Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Apply to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-700">
              Transform
            </span>{" "}
            Your Perspective.
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Join the vanguard of African intellectual liberation. Complete the
            form below to begin your journey.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-zinc-200/50 p-6 md:p-10 border border-zinc-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>

          <StepIndicator />

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <User className="text-emerald-600" />
                  <h3 className="text-2xl font-bold">Personal Identity</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">
                      ID Number
                    </label>
                    <input
                      type="text"
                      required
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      placeholder="XX-XXXXXX X XX"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-4 top-3.5 text-zinc-400"
                        size={18}
                      />
                      <input
                        type="date"
                        required
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Contact & Origin */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="text-emerald-600" />
                  <h3 className="text-2xl font-bold">Contact & Location</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-3.5 text-zinc-400"
                        size={18}
                      />
                      <input
                        type="email"
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-4 top-3.5 text-zinc-400"
                        size={18}
                      />
                      <input
                        type="tel"
                        required
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+263..."
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">
                      Nationality
                    </label>
                    <input
                      type="text"
                      required
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <MapPin size={16} /> Home Address
                    </label>
                    <textarea
                      name="homeAddress"
                      rows={2}
                      value={formData.homeAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Documents */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="text-emerald-600" />
                  <h3 className="text-2xl font-bold">Supporting Documents</h3>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "O-Level Results", field: "oLevelDocs" },
                    { label: "A-Level Results", field: "aLevelDocs" },
                    {
                      label: "National ID Copy/Passport",
                      field: "nationalIdDocs",
                    },
                  ].map((doc) => (
                    <div key={doc.field} className="group">
                      <label className="text-sm font-bold text-zinc-700 mb-2 block">
                        {doc.label}
                      </label>
                      <div className="relative border-2 border-dashed border-zinc-200 group-hover:border-emerald-300 rounded-2xl p-6 transition-colors flex flex-col items-center justify-center bg-zinc-50/50">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, doc.field)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="text-zinc-400 mb-2" size={24} />
                        <p className="text-sm text-zinc-500">
                          {(formData as any)[doc.field] ? (
                            <span className="text-emerald-600 font-medium">
                              {(formData as any)[doc.field]}
                            </span>
                          ) : (
                            <span>
                              Drag & drop or{" "}
                              <span className="text-emerald-600 font-bold underline">
                                browse
                              </span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="text-emerald-600" />
                  <h3 className="text-2xl font-bold">Review & Submit</h3>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500 block">Name</span>
                      <span className="font-bold">{formData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">ID</span>
                      <span className="font-bold">{formData.idNumber}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Email</span>
                      <span className="font-bold">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">DOB</span>
                      <span className="font-bold">{formData.dob}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-zinc-200">
                    <p className="text-xs text-zinc-500 italic">
                      By submitting this application, I confirm that all
                      information provided is accurate and I am ready to engage
                      in the #DecolonizingTheMind curriculum at Chitepo School
                      of Ideology.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-zinc-200 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-50 transition-colors"
                >
                  <ChevronLeft size={20} /> Back
                </button>
              )}

              <div className="ml-auto">
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    Continue <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-10 py-3 bg-zinc-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-xl ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting ? "Processing..." : "Submit Application"}
                    {!isSubmitting && <ArrowRight size={20} />}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <footer className="mt-12 text-center text-zinc-400 text-sm">
          <p>
            © {new Date().getFullYear()} Chitepo School of Ideology. Dedicated
            to Intellectual Liberation.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Terms of Service
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
