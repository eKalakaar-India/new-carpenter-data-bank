import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { FileText, Save, CheckCircle2, Undo } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { manualEntrySchema } from "../validations/manualEntry.schema";
import DashboardLayout from '../Dashboardlayout';

const INITIAL_STATE = {
  name: '',
  category: 'Other',
  description: '',
  mobile_number: '',
  aadhaar_number: '',
  age: '',
  gender: '',
  address: '',
  district: '',
  state: '',
  pincode: '',
  trade: '',
  experience: '',
  company: '',
  insurance_status: 'NOT_INSURED',
  training_status: 'PENDING',
  registration_date: '',
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

export default function ManualEntry() {
  const { addRecord } = useVaultStore();
  const [form, setForm] = useState(INITIAL_STATE);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const { register, handleSubmit, watch, setValue, reset, getValues, formState: {
        errors,
        isSubmitting,
        isDirty
    }} = useForm({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: INITIAL_STATE
  });

  useEffect(() => {

    const draft = localStorage.getItem(
        "vault_draft_carpenter_record"
    );

    if (!draft) return;

    try {

        reset(JSON.parse(draft));

        setIsDraftLoaded(true);

    } catch {}

}, [reset]);

  const values = watch()

  useEffect(() => {

    localStorage.setItem(
        "vault_draft_carpenter_record",
        JSON.stringify(values)
    );

}, [values]);

  // const handleInputChange = (key, val) => {
  //   const updatedForm = { ...form, [key]: val };
  //   setForm(updatedForm);
  //   localStorage.setItem('vault_draft_carpenter_record', JSON.stringify(updatedForm));
  //   setFeedback({ type: '', msg: '' });
  // };

  const handleClearDraft = () => {
    if (confirm('Clear current drafts?')) {
      reset(INITIAL_STATE);
      localStorage.removeItem('vault_draft_carpenter_record');
      setIsDraftLoaded(false);
      setFeedback({ type: 'info', msg: 'Draft memory purged.' });
    }
  };

  const onSubmit = async (data) => {

    setFeedback({
        type: "",
        msg: ""
    });

    console.log(data);
    try {
        await addRecord(data);

        reset(INITIAL_STATE);

        localStorage.removeItem(
            "vault_draft_carpenter_record"
        );

        setFeedback({

            type: "success",

            msg: "Record saved"

        });

    } catch (error) {

        setFeedback({

            type: "error",

            msg: error.message

        });
        console.log(error)

    }

};
  const categories = ['Master Carpenter', 'Apprentice', 'Cabinet Maker', 'Framer', 'Other'];

  return (
    <>
      {/* <DashboardLayout /> */}
      <div className="flex-1 overflow-y-auto p-8 relative bg-[#F5F7FA]">
        <div className="space-y-6 pb-10 text-slate-800">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-wide text-slate-900">
              Manual <span className="font-normal italic text-[var(--accent-primary)]">Vault Ledger</span>
            </h2>
            <p className="text-slate-550 text-xs mt-1 uppercase tracking-wider font-medium">
              Submit carpenter records to the backend using the current records schema.
            </p>
          </div>

          <div className="flex justify-center w-full">
            <div className="w-full max-w-3xl space-y-6">
              {feedback.msg && (
                <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-3 ${
                  feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-650' :
                  'bg-[var(--accent-glow)] border-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                }`}>
                  {feedback.type === 'success' && <CheckCircle2 size={16} />}
                  <span>{feedback.msg}</span>
                </div>
              )}

              {isDraftLoaded && !feedback.msg && (
                <div className="p-3 bg-[var(--accent-glow)] border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-xl text-xs flex justify-between items-center font-semibold">
                  <span>Draft configuration restored from local archive cache.</span>
                  <button onClick={handleClearDraft} className="text-[10px] uppercase font-bold text-red-650 hover:text-red-750 transition-colors">
                    Purge Draft
                  </button>
                </div>
              )}

              <div className="vault-card">
                <div className="flex items-center gap-2 border-b border-[#DDE3EA] pb-4 mb-6">
                  <FileText className="text-[var(--accent-primary)]" size={16} />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">Backend Records Entry</h3>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Name as per AADHAAR CARD *
                      </label>
                      <input
                        type="text"
                        placeholder="Full professional name"
                        {...register("name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.name.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Father's Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Full professional name"
                        {...register("fathername")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.fathername && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.fathername.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        {...register("mobile_number")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.mobile_number && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.mobile_number.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        placeholder="12-digit Aadhaar"
                        {...register("aadhaar_number")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.aadhaar_number && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.aadhaar_number.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        DOB
                      </label>
                      <input
                        type="date"
                        {...register("dob")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.dob && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.dob.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        min={18}
                        placeholder="Age"
                        {...register("age", {
                          valueAsNumber: true,
                        })}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.age && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.age.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Gender
                      </label>
                      <select
                        {...register("gender")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                      {errors.gender && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.gender.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col relative">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        State
                      </label>

                      <button
                        type="button"
                        onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] hover:border-[var(--accent-primary)]/40 text-slate-800 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent-primary)] font-semibold flex justify-between items-center w-full shadow-sm text-left transition-all"
                      >
                        <span>{watch("state") || "Select State"}</span>
                        <span className="text-slate-400 text-[10px]">▼</span>
                      </button>

                      {stateDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setStateDropdownOpen(false)}
                          />

                          <div
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DDE3EA] rounded-xl shadow-xl z-40 max-h-60 overflow-y-auto p-2.5 space-y-1 animate-fadeIn"
                            style={{ minWidth: "200px" }}
                          >
                            <input
                              type="text"
                              placeholder="Search state..."
                              value={stateSearch}
                              onChange={(e) => setStateSearch(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F5F7FA] border border-[#DDE3EA] rounded-lg text-xs focus:outline-none focus:border-[var(--accent-primary)] mb-2 font-semibold"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setValue("state", "", {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });

                                setStateDropdownOpen(false);
                                setStateSearch("");
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                                !watch("state")
                                  ? "bg-[var(--accent-glow)] text-[var(--accent-primary)] font-bold"
                                  : "text-slate-700 hover:bg-[#F5F7FA] transition-colors"
                              }`}
                            >
                              Select State
                            </button>

                            {INDIAN_STATES.filter((s) =>
                              s.toLowerCase().includes(stateSearch.toLowerCase())
                            ).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setValue("state", s, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });

                                  setStateDropdownOpen(false);
                                  setStateSearch("");
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                                  watch("state") === s
                                    ? "bg-[var(--accent-glow)] text-[var(--accent-primary)] font-bold"
                                    : "text-slate-700 hover:bg-[#F5F7FA] transition-colors"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        District
                      </label>

                      <input
                        type="text"
                        placeholder="District"
                        {...register("district")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.district && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.district.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Pincode
                      </label>

                      <input
                        type="text"
                        placeholder="6-digit pincode"
                        {...register("pincode")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.pincode && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.pincode.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col md:col-span-2">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Complete Address
                      </label>

                      <textarea
                        rows={3}
                        placeholder="Complete address"
                        {...register("address")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.address && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.address.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Marital Status
                      </label>

                      <select
                        {...register("marital_status")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select Status</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>

                      {errors.marital_status && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.marital_status.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Religion
                      </label>

                      <input
                        type="text"
                        placeholder="Religion"
                        {...register("religion")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.religion && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.religion.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee Name
                      </label>

                      <input
                        type="text"
                        placeholder="Nominee Name"
                        {...register("nom_name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.nom_name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nom_name.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee Gender
                      </label>

                      <select
                        {...register("nom_gender")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
                      </select>

                      {errors.nom_gender && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nom_gender.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee Mobile no.
                      </label>

                      <input
                        type="tel"
                        placeholder="Nominee Mobile"
                        {...register("nom_mobile")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.nom_mobile && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nom_mobile.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee DOB
                      </label>

                      <input
                        type="date"
                        {...register("nom_dob")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.nom_dob && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nom_dob.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee Relationship
                      </label>

                      <input
                        type="text"
                        placeholder="Nominee relationship"
                        {...register("nom_relationship")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.nom_relationship && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nom_relationship.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#DDE3EA] pt-6 flex justify-end gap-3">
                    <button type="button" onClick={handleClearDraft} className="btn-frosted text-sm font-semibold flex items-center gap-2">
                      <Undo size={14} />
                      <span>Discard Ledger Form</span>
                    </button>
                    <button type="submit" className="btn-gold text-sm font-semibold flex items-center gap-2">
                      <Save size={14} />
                      <span>Save Records Entry</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



