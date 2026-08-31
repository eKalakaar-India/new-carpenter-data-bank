import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { FileText, Save, CheckCircle2, Undo } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema } from "../validations/manualEntry.schema";
import DashboardLayout from '../Dashboardlayout';
import statesData from "../constants/StateDistrictData.json"; 
import ImageUpload from "../Component/ImageUpload"


const INITIAL_STATE = {
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: '',
  date_of_birth: '',
  marital_status: '',
  mobile_no:'',
  religion: '',
  fathers_name: '',
  mothers_name: '',
  guardians_name: '',
  social_category:'',
  disability:'',
  mobile_number: '',
  id_no: '',
  id_type: '',
  id_img:'',
  age: '',
  address: '',
  district: '',
  state: '',
  city_block_taluka:'',
  gram_panchayat:'',
  village:'',
  pin_code: '',
  email_id:'',
  education_level:'',
  employed:'',
  nominee_first_name: '',
  nominee_middle_name: '',
  nominee_last_name: '',
  nominee_gender: '',
  nominee_date_of_birth: '',
  nominee_relationship: '',
  nominee_mobile_no: '',
};



export default function ManualEntry() {
  const { addRecord } = useVaultStore();
  const [form, setForm] = useState(INITIAL_STATE);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const fileInputRef = useRef(null);
  const { register, handleSubmit, watch, setValue, reset, getValues, formState: {
        errors,
        isSubmitting,
        isDirty
    }} = useForm({
    resolver: zodResolver(userProfileSchema),
    defaultValues: INITIAL_STATE
  });

  const [isDragging, setIsDragging] = useState(false);
  const handleFile = (file) => {
      if (!file) return;
      const isValid = VALID_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
      if (!isValid) {
        useVaultStore.setState({ error: 'That file type is not supported. Choose an .xlsx or .xls file.' });
        return;
      }
      setSelectedFile(file);
    };
  
    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files?.[0]);
    };

   const { 
      records,
      filters
  } = useVaultStore();

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

  const formattedMaxDate = useMemo(() => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return maxDate.toISOString().split("T")[0]; // YYYY-MM-DD
  }, []);

  const dob = watch("date_of_birth");


  useEffect(() => {
    if (!dob) {
      setValue("age", "");
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();

    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust if birthday hasn't occurred yet this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }

    // Set the value in React Hook Form state
    setValue("age", calculatedAge > 0 ? calculatedAge : 0, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [dob, setValue]);




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

  const INDIAN_STATES = statesData.states.map((item) => item.state);

  const selectedState = watch("state");
  
  const getDistricts = (selectedState) => {
    return (
      statesData.states.find((item) => item.state === selectedState)?.districts || []
    );
  };

  const districts = useMemo(() => {
    if (!selectedState) return [];

    return (
      statesData.states.find(
        ({ state }) => state === selectedState
      )?.districts ?? []
    );
  }, [selectedState]);

  const onSubmit = async (data) => {
    setFeedback({
      type: "",
      msg: "",
    });
    
    console.log(data);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      formData.append(
        "full_name",
        `${data.first_name} ${data.middle_name || ""} ${data.last_name}`.trim()
      );

      formData.append(
        "nominee_full_name",
        `${data.nominee_first_name} ${data.nominee_middle_name || ""} ${data.nominee_last_name}`.trim()
      );

      // console.log("========== FormData ==========");

      // for (const [key, value] of formData.entries()) {
      //   console.log(key, value);
      // }

      // console.log("==============================");

      await addRecord(formData);

      reset(INITIAL_STATE);

      localStorage.removeItem("vault_draft_carpenter_record");

      setFeedback({
        type: "success",
        msg: "Record saved",
      });

    } catch (error) {

      setFeedback({
        type: "errors",
        msg: error.message,
      });

      console.log(error);
    }
  };
  const categories = ['Master Carpenter', 'Apprentice', 'Cabinet Maker', 'Framer', 'Other'];

  return (
    <>
      {/* <DashboardLayout /> */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative bg-[#F5F7FA]">
        <div className="space-y-6 pb-10 sm:p-2 text-slate-800">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-wide text-slate-900">
              Manual <span className="font-normal italic text-[var(--accent-primary)]">Vault Ledger</span>
            </h2>
            <p className="text-slate-550 text-xs mt-1 uppercase tracking-wider font-medium">
              Submit carpenter records to the backend using the current records schema.
            </p>
          </div>

          <div className="flex justify-center w-full">
            <div className="w-full max-w-full xl:max-w-5xl space-y-6">
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
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">Carpenters Records Entry</h3>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                      {/* <div className='flex flex-col md:col-span-2'>
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                            isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-white'
                          }`}
                        >
                          <svg className="h-9 w-9 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                          <p className="mt-3 text-sm text-slate-600">
                            Drag your file here, or{' '}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="font-medium text-red-600 hover:text-teal-700"
                            >
                              browse
                            </button>
                          </p>
                          <p className="mt-1 text-xs text-slate-400">.jpeg, .jpg, .png up to 10MB</p>
                          <input
                            ref={fileInputRef}
                            {...register("id_file")}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFile(e.target.files?.[0])}
                          />
                        </div>

                        {errors.id_file && (
                          <span className="text-xs text-red-500 mt-1">
                            {errors.id_file.message}
                          </span>
                        )}
                      </div> */}
                      <ImageUpload
                        name="id_img"
                        label="ID Photo (आईडी फ़ोटो)"
                        watch={watch}
                        setValue={setValue}
                        error={errors.id_img}
                      />
                      <div className="flex flex-col">
                        <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                          ID TYPE (ID का प्रकार) <span className='text-red-900'>*</span>
                        </label>

                        <select
                          {...register("id_type")}
                          className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                        >
                          <option value="">Select Type of ID</option>
                          <option value="AAdhaar Card">AAdhaar Card</option>
                          <option value="Pancard">Pancard</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Voter ID Card">Voter ID Card</option>
                        </select>

                        {errors.id_type && (
                          <span className="text-xs text-red-500 mt-1">
                            {errors.id_type.message}
                          </span>
                        )}
                      </div>

                     <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        ID Number (आईडी नंबर) <span className='text-red-900'>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ID No."
                        {...register("id_no")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.id_no && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.id_no.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        First Name as per ID CARD (ID कार्ड के अनुसार पहला नाम) <span className='text-red-900'>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="First name"
                        {...register("first_name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.first_name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.first_name.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Middle Name as per ID CARD (ID कार्ड के अनुसार बीच का नाम)
                      </label>
                      <input
                        type="text"
                        placeholder="Middle name"
                        {...register("middle_name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.middle_name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.middle_name.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Last Name as per ID CARD (ID कार्ड के अनुसार अंतिम नाम)<span className='text-red-900'>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Full professional name"
                        {...register("last_name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.last_name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.last_name.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Father's Name (पिता का नाम)*
                      </label>
                      <input
                        type="text"
                        placeholder="Father's name"
                        {...register("fathers_name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.fathers_name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.fathers_name.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Mother's Name (मां का नाम) *
                      </label>
                      <input
                        type="text"
                        placeholder="Mother's name"
                        {...register("mothers_name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.mothers_name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.mothers_name.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Guardian's Name (अभिभावक का नाम)
                      </label>
                      <input
                        type="text"
                        placeholder="Guardian's name"
                        {...register("guardians_name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.guardians_name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.guardians_name.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Email (ईमेल)
                      </label>
                      <input
                        type="email"
                        placeholder="Email ID"
                        {...register("email_id")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.email_id && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.email_id.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Mobile Number (मोबाइल नंबर) <span className='text-red-900'>*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        {...register("mobile_no")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.mobile_no && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.mobile_no.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Social Category (सामाजिक श्रेणी) <span className='text-red-900'>*</span>
                      </label>

                      <select
                        {...register("social_category")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select Category</option>
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>

                      {errors.social_category && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.social_category.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Education Level (Education Level) <span className='text-red-900'>*</span>
                      </label>

                      <select
                        {...register("education_level")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select Category</option>
                        <option value="Illiterate">Illiterate</option>
                        <option value="10th Pass">10th Pass</option>
                        <option value="12th Pass">12th Pass</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>

                      {errors.education_level && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.education_level.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Disability (विकलांगता) <span className='text-red-900'>*</span>
                      </label>

                      <select
                        {...register("disability")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select Status</option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>

                      {errors.disability && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.disability.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Employment Status (रोज़गार की स्थिति) <span className='text-red-900'>*</span>
                      </label>

                      <select
                        {...register("employment_status")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select Status</option>
                        <option value="Self Employed">Self Employed </option>
                        <option value="Wage Employed">Wage Employed </option>
                        <option value="Unemployed">Unemployed</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Employed (रोज़गार की स्थिति) <span className='text-red-900'>*</span>
                      </label>

                      <select
                        {...register("employed")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select Status</option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>

                      {errors.employed && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.employed.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Date of Birth (जन्म तिथि) <span className='text-red-900'>*</span>
                      </label>
                      <input
                        type="date"
                        {...register("date_of_birth")}
                        max={formattedMaxDate}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />
                      {errors.date_of_birth && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.date_of_birth.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Age (आयु) <span className='text-red-900'>*</span>
                      </label>
                      <input
                        type="number"
                        min={18}
                        readOnly // Recommended: prevents user manual overrides
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
                        Gender (लिंग) <span className='text-red-900'>*</span>
                      </label>
                      <select
                        {...register("gender")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="TRANSGENDER">TRANSGENDER</option>
                      </select>
                      {errors.gender && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.gender.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col relative">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        State (राज्य) <span className='text-red-900'>*</span>
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

                                  setValue("district", "", {
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

                    <div className="flex flex-col relative">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        District (ज़िला) <span className='text-red-900'>*</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] hover:border-[var(--accent-primary)]/40 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--accent-primary)] font-semibold flex justify-between items-center w-full shadow-sm text-left transition-all"
                        disabled={!selectedState}
                      >
                        <span>
                          {watch("district") || "-- All Districts --"}
                        </span>
                        <span className="text-slate-400 text-[10px]">▼</span>
                      </button>

                      {districtDropdownOpen && (
                        <>
                          {/* Invisible Click Overlay */}
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setDistrictDropdownOpen(false)}
                          />

                          {/* Dropdown */}
                          <div
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DDE3EA] rounded-xl shadow-xl z-40 max-h-60 overflow-y-auto p-2.5 space-y-1 animate-fadeIn"
                            style={{ minWidth: "200px" }}
                          >
                            <input
                              type="text"
                              placeholder="Search district..."
                              value={districtSearch}
                              onChange={(e) => setDistrictSearch(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F5F7FA] border border-[#DDE3EA] rounded-lg text-xs focus:outline-none focus:border-[var(--accent-primary)] mb-2 font-semibold"
                            />

                            <button
                              type="button"
                              onClick={() => {
                               setValue("district", "", {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              setDistrictDropdownOpen(false);
                              setDistrictSearch("");
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                                !filters.district
                                  ? "bg-[var(--accent-glow)] text-[var(--accent-primary)] font-bold"
                                  : "text-slate-700 hover:bg-[#F5F7FA] transition-colors"
                              }`}
                            >
                              -- All Districts --
                            </button>

                            {districts.filter((d) =>
                              d.toLowerCase().includes(districtSearch.toLowerCase())
                            ).map((district) => (
                              <button
                                key={district}
                                type="button"
                                onClick={() => {
                                  setValue("district", district, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                  setDistrictDropdownOpen(false);
                                  setDistrictSearch("");
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                                  filters.district === district
                                    ? "bg-[var(--accent-glow)] text-[var(--accent-primary)] font-bold"
                                    : "text-slate-700 hover:bg-[#F5F7FA] transition-colors"
                                }`}
                              >
                                {district}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Pincode (पिनकोड) <span className='text-red-900'>*</span>
                      </label>

                      <input
                        type="text"
                        placeholder="6-digit pincode"
                        {...register("pin_code")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.pin_code && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.pin_code.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Taluka / City / Town (तालुका / शहर / कस्बा) <span className='text-red-900'>*</span>
                      </label>

                      <input
                        type="text"
                        placeholder="Taluka / City / Town"
                        {...register("city_block_taluka")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.city_block_taluka && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.city_block_taluka.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Gram Panchayat (ग्राम पंचायत)
                      </label>

                      <input
                        type="text"
                        placeholder="GramPanchayat"
                        {...register("gram_panchayat")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.gram_panchayat && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.gram_panchayat.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Village (गाँव)
                      </label>

                      <input
                        type="text"
                        placeholder="Village"
                        {...register("village")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.village && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.village.message}
                        </span>
                      )}
                    </div>
                    

                    <div className="flex flex-col md:col-span-2">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Complete Address (पूर्ण पता) <span className='text-red-900'>*</span>
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
                        Marital Status (वैवाहिक स्थिति) <span className='text-red-900'>*</span>
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
                        Religion (धर्म) <span className='text-red-900'>*</span>
                      </label>

                      {/* <input
                        type="text"
                        placeholder="Religion"
                        {...register("religion")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      /> */}

                      <select
                        {...register("religion")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select Religion</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Jain">Jain</option>
                        <option value="Buddhist">Buddhist</option>
                        <option value="Christian">Christian</option>
                      </select>

                      {errors.religion && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.religion.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee First Name (नॉमिनी का पहला नाम) <span className='text-red-900'>*</span>
                      </label>

                      <input
                        type="text"
                        placeholder="Nominee First Name"
                        {...register("nominee_first_name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.nominee_first_name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nominee_first_name.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee Middle Name (नॉमिनी का बीच का नाम)
                      </label>

                      <input
                        type="text"
                        placeholder="Nominee Middle Name"
                        {...register("nominee_middle_name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.nominee_middle_name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nominee_middle_name.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee Last Name (नॉमिनी का उपनाम) <span className='text-red-900'>*</span>
                      </label>

                      <input
                        type="text"
                        placeholder="Nominee Last Name"
                        {...register("nominee_last_name")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.nominee_last_name && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nominee_last_name.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee Gender (नॉमिनी का लिंग) <span className='text-red-900'>*</span>
                      </label>

                      <select
                        {...register("nominee_gender")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
                      </select>

                      {errors.nominee_gender && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nominee_gender.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee Mobile no. (नॉमिनी का मोबाइल नंबर) <span className='text-red-900'>*</span>
                      </label>

                      <input
                        type="tel"
                        placeholder="Nominee Mobile"
                        {...register("nominee_mobile_no")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.nominee_mobile_no && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nominee_mobile_no.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee Date of Birth (नॉमिनी की जन्म तिथि) <span className='text-red-900'>*</span>
                      </label>

                      <input
                        type="date"
                        {...register("nominee_date_of_birth")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      />

                      {errors.nominee_date_of_birth && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nominee_date_of_birth.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        Nominee Relationship (नॉमिनी से संबंध) <span className='text-red-900'>*</span>
                      </label>

                      {/* <input
                        type="text"
                        placeholder="Nominee relationship"
                        {...register("nominee_relationship")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      /> */}

                      <select
                        {...register("nominee_relationship")}
                        className="bg-[#F5F7FA] border border-[#DDE3EA] text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]/80 focus:ring-1 focus:ring-[var(--accent-primary)]/20 font-semibold"
                      >
                        <option value="">Select relationship</option>
                        <option value="FATHER">FATHER</option>
                        <option value="MOTHER">MOTHER</option>
                        <option value="Wife">Wife</option>
                        <option value="CHILD">CHILD</option>
                        <option value="OTHER">OTHER</option>
                      </select>

                      {errors.nominee_relationship && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.nominee_relationship.message}
                        </span>
                      )}
                    </div>
                  </div>
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

                  <div className="border-t border-[#DDE3EA] pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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



