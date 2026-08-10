import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useVaultStore } from '../store/vaultStore';
import axios from 'axios';
import { 
  Search, 
  Trash2, 
  Download, 
  Edit, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Plus,
  RefreshCw,
  Sparkles,
  GitMerge,
  HelpCircle,
  AlertTriangle,
  Award,
  Shield,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';
import { exportUsersToExcel } from "../utils/exportExcel";
import statesData from "../constants/StateDistrictData.json";
import { Link } from 'react-router-dom';


const VAULT_FIELDS = [
  { key: 'enrollmentNumber', label: 'Enrollment Number' },
  { key: 'enrollmentDate', label: 'Enrollment Date' },
  { key: 'subdivision', label: 'Subdivision' },
  { key: 'firstName', label: 'First Name' },
  { key: 'middleName', label: 'Middle Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'enrollmentNumRegister', label: 'Enrollment Register No' },
  { key: 'enrollmentYear', label: 'Enrollment Year' },
  { key: 'enrollmentMonth', label: 'Enrollment Month' },
  { key: 'reasonFor', label: 'Reason For' },
  { key: 'reasonForEdit', label: 'Reason For Edit' },
  { key: 'carpenterId', label: 'Carpenter ID' },
  { key: 'motherName', label: 'Mother\'s Name' },
  { key: 'fatherName', label: 'Father\'s Name' },
  { key: 'husbandName', label: 'Husband\'s Name' },
  { key: 'religion', label: 'Religion' },
  { key: 'workability', label: 'Workability' },
  { key: 'physicalDisability', label: 'Physical Disability' },
  { key: 'officer', label: 'Officer Name' },
  { key: 'officeName', label: 'Office Name' },
  { key: 'salutation', label: 'Salutation' },
  { key: 'certificateNumber', label: 'Certificate Number' },
  { key: 'candidateNumber', label: 'Candidate Number' },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'occupationProfession', label: 'Occupation/Profession' },
  { key: 'maritalStatus', label: 'Marital Status' },
  { key: 'guardiansName', label: "Guardian's Name" },
  { key: 'disability', label: 'Disability' },
  { key: 'typeofDisability', label: 'Type of Disability' },
  { key: 'pinCode', label: 'Pin Code' },
  { key: 'idType', label: 'ID Type' },
  { key: 'typeofAlternateID', label: 'Type of Alternate ID' },
  { key: 'idNo', label: 'ID Number' },
  { key: 'educationLevel', label: 'Education Level' },
  { key: 'preTrainingStatus', label: 'Pre-Training Status' },
  { key: 'previousExperienceSector', label: 'Previous Experience Sector' },
  { key: 'noofmonthsofpreviousexperience', label: 'No. of Months of Prev. Experience' },
  { key: 'employed', label: 'Employed Status' },
  { key: 'employmentStatus', label: 'Employment Status' },
  { key: 'employmentDetails', label: 'Employment Details' },
  { key: 'heardAboutUs', label: 'Heard About Us' },
  { key: 'nomineeName', label: 'Nominee Name' },
  { key: 'nomineeGender', label: 'Nominee Gender' },
  { key: 'nomineeDOB', label: 'Nominee DOB' },
  { key: 'nomineeRelationship', label: 'Nominee Relationship' },
  { key: 'emptyColumn', label: 'Additional Unmapped Metadata' }
];

export default function Records() {
  const { 
    records, 
    recordsLoading, 
    pagination, 
    filters, 
    aggregates,
    fetchRecords, 
    setFilters, 
    deleteRecord, 
    bulkDeleteRecords,
    updateRecord,
    deduplicateRecords,
    uploadDocument,
    deleteRecordParticipant,
    addToBatch,
    fetchAllBatches,
    allBatches,
    resolveStorageFileUrl
  } = useVaultStore();

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([])
  const [editingRecord, setEditingRecord] = useState(null);
  const [activeVaultRecord, setActiveVaultRecord] = useState(null);
  const [verifyModalRecord, setVerifyModalRecord] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyImageUrl, setVerifyImageUrl] = useState('');
  
  const [searchVal, setSearchVal] = useState(filters.search);

  // Custom searchable dropdown states
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [districtDropdownOpen , setDistrictDropdownOpen ] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // States for Edit Modal custom searchable dropdowns
  const [editCategoryDropdownOpen, setEditCategoryDropdownOpen] = useState(false);
  const [editCategorySearch, setEditCategorySearch] = useState('');
  const [editStateDropdownOpen, setEditStateDropdownOpen] = useState(false);
  const [editStateSearch, setEditStateSearch] = useState('');
  const [batchId, setBatchID] = useState('');

  // Synchronized scrollbar refs
  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);

  // Hidden File Upload Trigger states
  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null); // { id, docType }

  const handleTopScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleTableScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    fetchRecords(1);
    fetchAllBatches()
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters({ search: searchVal });
      fetchRecords(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVal]);

  const handleFilterChange = (key, val) => {
    setFilters({ [key]: val });
    fetchRecords(1);
  };

  const handlePageChange = (newPage) => {
    fetchRecords(newPage);
  };

  function formatDate(dateString) {
    const date = new Date(dateString);

    return `${date.getDate().toString().padStart(2, "0")} ${
      date.toLocaleString("en-US", { month: "short" })
    }, ${date.getFullYear()}`;
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(records.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e, id, data) => {
    console.log(data);
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
      setSelectedRecords(prev => [...prev, data]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} carpenters? This is irreversible.`)) {
      const success = await bulkDeleteRecords(selectedIds);
      if (success) {
        setSelectedIds([]);
      }
    }
  };

  const handleBulkAddToBatch = async ()=>{
    let res = await addToBatch({ids: selectedIds, batch:batchId});
    if(res){
      alert('Carpenters added to batch');
    }else{
      alert('Could not add to Batch')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to clear this entry?')) {
      await deleteRecordParticipant(id);
    }
    fetchRecords(1);
  };

  const handleVerifyClick = async (record) => {
    setVerifyModalRecord(record);
    setVerifyImageUrl('');

    if (record?.id_link) {
      const resolvedUrl = await resolveStorageFileUrl(record.id_link);
      console.log('Resolved URL:', resolvedUrl);
      setVerifyImageUrl(resolvedUrl || '');
    }
  };

  const handleConfirmVerification = async () => {
    if (!verifyModalRecord) return;

    try {
      setIsVerifying(true);
      await updateRecord(verifyModalRecord.id, { isVerified: true });
      setVerifyModalRecord(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      console.log(editingRecord)
      await updateRecord(editingRecord.id, editingRecord);
      setEditingRecord(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDocClick = (id, docType, existingLink) => {
    if (existingLink) {
      if (existingLink.startsWith('http://') || existingLink.startsWith('https://')) {
        window.open(existingLink, '_blank');
      } else {
        // Assume it's a file token or path stored in the backend uploads folder
        window.open(`/uploads/documents/${existingLink}`, '_blank');
      }
    } else {
      // Open upload selector
      setUploadTarget({ id, docType });
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadTarget) return;

    try {
      await uploadDocument(uploadTarget.id, uploadTarget.docType, file);
      alert(`${uploadTarget.docType} uploaded successfully.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadTarget(null);
      e.target.value = '';
    }
  };

  const triggerExport = (type) => {
    const idsQuery = selectedIds.length > 0 ? `?ids=${selectedIds.join(',')}` : '';
    axios.get(`/export/${type}${idsQuery}`, { responseType: 'blob' })
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Vault_Carpenter_Export_${Date.now()}.${type}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(err => {
        console.error('Export failed:', err);
        alert('Failed to export files from the vault. Please verify your connection.');
      });
  };

  const categories = ['Master Carpenter', 'Apprentice', 'Cabinet Maker', 'Framer', 'Other'];

  const INDIAN_STATES = statesData.states.map((item) => item.state);

  const getDistricts = (selectedState) => {
    return (
      statesData.states.find((item) => item.state === selectedState)?.districts || []
    );
  };

  const districts = useMemo(() => {
    if (!filters.state) return [];

    return (
      statesData.states.find((s) => s.state === filters.state)?.districts || []
    );
  }, [filters.state]);

  // Reusable pagination element
  const renderPagination = (positionLabel) => {
    if (recordsLoading || pagination.totalPages <= 1) return null;
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-[#DDE3EA] rounded-xl shadow-sm text-xs">
        <span className="font-semibold text-slate-500">
          Displaying {positionLabel} entries {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-1.5 border border-[#DDE3EA] bg-white rounded-lg hover:bg-[#ECEFF4] disabled:opacity-30 transition-colors text-slate-700 shadow-sm"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-bold px-3 py-1 bg-[#ECEFF4] border border-[#DDE3EA] rounded-md text-[var(--accent-primary)]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-1.5 border border-[#DDE3EA] bg-white rounded-lg hover:bg-[#ECEFF4] disabled:opacity-30 transition-colors text-slate-700 shadow-sm"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10 text-slate-800">
      
      {/* Hidden file input for uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
      />

      {/* Table Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-slate-900">
            Carpenter <span className="font-normal italic text-[var(--accent-primary)]">Records</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-medium">
            Search, sort, filter, and extract intelligence from active records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => exportUsersToExcel(selectedRecords)}
            className="btn-gold text-sm font-semibold"
          >
            <span>Excel Sheet</span>
          </button>
        </div>
      </div>

      {/* Global Search and Bulk Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-[#DDE3EA] rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:max-w-2xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Global search by Name, Mobile no, aadhaar no, "
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/65 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]/20"
            />
          </div>
          {/* <button
            onClick={async () => {
              if (confirm("Are you sure you want to run deduplication on all active database records? This will automatically merge identical or related profiles under the same carpenter name.")) {
                try {
                  const res = await deduplicateRecords();
                  alert(`Deduplication complete! Merged and cleaned ${res.mergedCount} duplicate entries.`);
                } catch (err) {
                  alert(err.message);
                }
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all whitespace-nowrap animate-pulse"
          >
            <GitMerge size={16} />
            <span>Remove Duplicates</span>
          </button> */}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2">
            <select onChange={(e)=>setBatchID(e.target.value)}>
              <option>---Select Batch---</option>
              {
                allBatches && allBatches.map((item, index)=>(
                  <option key={index} value={item.id}>{item.batch_id}</option>
                ))
              }
            </select>
            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-xl shadow-sm transition-colors text-xs font-semibold">
              <button 
                onClick={handleBulkAddToBatch}
              >
                Add To Batch
              </button>
            </div>
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 shadow-sm">
              <span>Selected {selectedIds.length} Entries</span>
              <button 
                onClick={handleBulkDelete}
                className="p-1.5 hover:bg-red-100 rounded-lg border border-red-200 hover:text-red-700 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Filters Area (Horizontal Grid above the table) */}
      <div className="vault-card !overflow-visible grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-[#DDE3EA]">

        {/* State */}
        <div className="flex flex-col relative">
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">State Jurisdiction</label>
          <button
            type="button"
            onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
            className="bg-[#F5F7FA] border border-[#DDE3EA] hover:border-[var(--accent-primary)]/40 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--accent-primary)] font-semibold flex justify-between items-center w-full shadow-sm text-left transition-all"
          >
            <span>{filters.state || '-- All States --'}</span>
            <span className="text-slate-400 text-[10px]">▼</span>
          </button>

          {stateDropdownOpen && (
            <>
              {/* Invisible Click Overlay to Close */}
              <div className="fixed inset-0 z-30" onClick={() => setStateDropdownOpen(false)} />
              
              {/* Dropdown Container */}
              <div 
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DDE3EA] rounded-xl shadow-xl z-40 max-h-60 overflow-y-auto p-2.5 space-y-1 animate-fadeIn"
                style={{ minWidth: '200px' }}
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
                    handleFilterChange('state', '');
                    setStateDropdownOpen(false);
                    setStateSearch('');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${!filters.state ? 'bg-[var(--accent-glow)] text-[var(--accent-primary)] font-bold' : 'text-slate-700 hover:bg-[#F5F7FA] transition-colors'}`}
                >
                  -- All States --
                </button>
                {INDIAN_STATES
                  .filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()))
                  .map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        handleFilterChange('state', s);
                        setStateDropdownOpen(false);
                        setStateSearch('');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${filters.state === s ? 'bg-[var(--accent-glow)] text-[var(--accent-primary)] font-bold' : 'text-slate-700 hover:bg-[#F5F7FA] transition-colors'}`}
                    >
                      {s}
                    </button>
                  ))
                }
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col relative">
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
            District
          </label>

          <button
            type="button"
            onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
            className="bg-[#F5F7FA] border border-[#DDE3EA] hover:border-[var(--accent-primary)]/40 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--accent-primary)] font-semibold flex justify-between items-center w-full shadow-sm text-left transition-all"
            disabled={!filters.state}
          >
            <span>
              {filters.district || "-- All Districts --"}
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
                    handleFilterChange("state", s);
                    handleFilterChange("district", "");
                    setStateDropdownOpen(false);
                    setStateSearch("");
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
                      handleFilterChange("district", district);
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

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchVal('');
              setFilters({ category: '', state: '', district:'' });
              fetchRecords(1);
            }}
            className="w-full py-2.5 bg-[#E8ECF2] hover:bg-[#DDE3EA] text-xs text-[var(--accent-primary)] hover:text-red-750 border border-[#DDE3EA] rounded-lg transition-colors font-bold shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Pagination Controls at the Start (Top) of Vault Data */}
      {renderPagination("top")}

      {/* Scrollable Spreadsheet Table Container */}
      <div className="vault-table-container transition-all duration-300">
        {recordsLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white">
            <RefreshCw className="text-[var(--accent-primary)] animate-spin" size={32} />
            <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Unlocking Vault Records...</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Top Horizontal Scrollbar Helper */}
            <div 
              ref={topScrollRef} 
              onScroll={handleTopScroll}
              className="overflow-x-auto w-full border-b border-[#DDE3EA] bg-[#F5F7FA]"
              style={{ height: '12px' }}
            >
              <div style={{ width: '5200px', height: '1px' }} />
            </div>
            
            {/* Table Scrollable Container */}
            <div 
              ref={tableScrollRef}
              onScroll={handleTableScroll}
              className="overflow-x-auto"
            >
              <table className="vault-table min-w-[5200px]">
              <thead>
                <tr>
                  <th className="w-12 text-center sticky left-0 bg-[#E8ECF2] z-20 border-r border-[#DDE3EA]">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={records.length > 0 && selectedIds.length === records.length}
                      className="rounded border-[#DDE3EA] bg-white text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20 h-4 w-4"
                    />
                  </th>
                  <th className="w-20">Sr No</th>
                  {/* <th className="w-36">Candidate Number</th> */}
                  <th className="w-36">Enrollment Date</th>
                  <th className="w-48">Full Name</th>
                  <th className="w-48">Batch Data</th>
                  <th className="w-36">Certificate</th>
                  <th className="w-36">Insurance</th>
                  <th className="w-40 text-center">Credentials Vault</th>
                  <th className="w-32">Date of Birth</th>
                  <th className="w-32">Marital Status</th>
                  <th className="w-28">Religion</th>
                  <th className="w-28">Pin Code</th>
                  <th className="w-36">AADHAAR ID Number</th>
                  <th className="w-44">Nominee Name</th>
                  <th className="w-32">Nominee Gender</th>
                  <th className="w-32">Nominee DOB</th>
                  <th className="w-40">Nominee Relationship</th>
                  <th className="w-32">State</th>
                  <th className="w-32">City / District</th>
                  <th className="w-64">Address details</th>
                  <th className="w-52">Remarks</th>
                  <th className="w-24 text-center sticky right-0 bg-[#E8ECF2] z-20 border-l border-[#DDE3EA]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, index) => (
                  <tr 
                     key={rec.id} 
                     className={selectedIds.includes(rec.id) ? 'bg-[var(--accent-glow)]' : ''}
                  >
                    <td className="text-center sticky left-0 z-10 border-r border-[#DDE3EA] sticky-col">
                      <input 
                        type="checkbox" 
                        onChange={(e) => handleSelectRow(e, rec.id, rec)}
                        checked={selectedIds.includes(rec.id)}
                        className="rounded border-[#DDE3EA] bg-white text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20 h-4 w-4"
                      />
                    </td>
                    <td className="font-semibold text-[var(--accent-primary)]">{index + 1 || 'NA'}</td>
                    <td className="text-xs text-slate-600">{formatDate(rec.created_at) || 'NA'}</td>
                    <td className="font-serif font-bold text-slate-900 text-sm">{rec.full_name || 'NA'}</td>
                    <td className="font-serif font-bold text-slate-900 text-sm">
                      <div>
                        {rec.batch_data?.batch_id || 'NA'}
                      </div>
                      <div>
                        {rec.batch_data?.status || 'NA'}
                      </div>
                    </td>
                    <td className="text-xs text-slate-700">{rec.has_certificate ? "Yes" : "No" || 'NA'}</td>
                    <td className="text-xs text-slate-600 font-mono">{rec.has_insurance ? "Yes" : "No" || 'NA'}</td>
                    
                    {/* Embedded documents icons */}
                    <td className="text-center">
                      <div className="inline-flex gap-2.5 justify-center items-center">
                        <a
                          href={rec?.certificate_link }
                          target={rec?.has_certificate ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className={`p-1.5 rounded-lg border transition-all ${
                            rec?.has_certificate 
                              ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm' 
                              : 'bg-slate-50 text-slate-400 hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] border-[#DDE3EA]'
                          }`}
                          title={rec.has_certificate ? "Open Professional Certificate" : "Certificate not uploaded yet."}
                        >
                          <Award size={14} />
                        </a>
                        <a
                          href={rec?.insurance_links.niva || '#' }
                          target={rec?.has_insurance ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className={`p-1.5 rounded-lg border transition-all ${
                            rec?.has_insurance 
                              ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                              : 'bg-slate-50 text-slate-400 hover:text-blue-500 hover:border-blue-500 border-[#DDE3EA]'
                          }`}
                          title={rec.has_insurance ? "Open Primary Insurance" : "Niva Insurance not uploaded yet."}
                        >
                          <Shield size={14} />
                        </a>
                        <a
                          href={rec?.insurance_links.MSwasth || '#'}
                          target={rec?.has_insurance ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className={`p-1.5 rounded-lg border transition-all ${
                            rec.has_insurance 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' 
                              : 'bg-slate-50 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 border-[#DDE3EA]'
                          }`}
                          title={rec.has_insurance ? "Open MSwasth Insurance" : "MSwasth Insurance not uploaded yet."}
                        >
                          <ShieldCheck size={14} />
                        </a>
                      </div>
                    </td>

                    <td className="text-xs text-slate-600">{formatDate(rec.date_of_birth) || 'NA'}</td>
                    <td className="text-xs text-slate-600">{rec.marital_status || 'NA'}</td>
                    <td className="text-xs text-slate-600">{rec.religion || 'NA'}</td>
                    <td className="text-xs text-slate-600 font-mono">{rec.pin_code || 'NA'}</td>
                    <td className="text-xs text-slate-600">{rec.id_no || 'NA'}</td>
                    <td className="text-xs text-slate-750 font-bold">{rec.nominee_full_name || 'NA'}</td>
                    <td className="text-xs text-slate-600">{rec.nominee_gender || 'NA'}</td>
                    <td className="text-xs text-slate-600">{rec.nominee_date_of_birth || 'NA'}</td>
                    <td className="text-xs text-slate-650">{rec.nominee_relationship || 'NA'}</td>
                    <td className="text-xs text-slate-500 max-w-[120px] truncate">{rec.state || 'NA'}</td>
                    <td className="text-xs text-slate-500 max-w-[120px] truncate">{rec.district || 'NA'}</td>
                    <td className="text-xs text-slate-500 max-w-[200px] truncate" title={rec.address}>{rec.address || 'NA'}</td>
                    <td className="text-xs text-slate-500 max-w-[200px] truncate">{rec.remarks || 'NA'}</td>
                    <td className="text-center flex flex-col justify-center items-center sticky right-0 z-10 border-l border-[#DDE3EA] sticky-col">
                      <button disabled={rec.isVerified} onClick={() => handleVerifyClick(rec)} className={`px-4 py-1 ${rec.isVerified ? 'bg-emerald-500' : 'bg-[var(--accent-primary)]'} text-white text-xs font-semibold rounded-lg shadow-sm transition-colors`}>
                        {rec.isVerified ? 'Verified' : 'Verify'}
                      </button>
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => setEditingRecord(rec)}
                          className="p-1 hover:bg-[#F5F7FA] rounded text-slate-550 hover:text-[var(--accent-primary)] transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(rec.id)}
                          className="p-1 hover:bg-[#F5F7FA] rounded text-slate-555 hover:text-red-650 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={41} className="text-center py-24 text-slate-400 text-xs font-medium">No ledger records decrypted matching filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>

      {/* Pagination Controls at the Bottom of Vault Data */}
      {renderPagination("bottom")}

      {/* Quick Edit Popup Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDE3EA] max-w-3xl w-full rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
            <button 
              onClick={() => setEditingRecord(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-6">Modify Ledger Relationship Entry</h3>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Carpenter Name */}
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Carpenter Name *</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.aadhar_name || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, aadhar_name: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                {/* State Custom Dropdown */}
                <div className="flex flex-col relative">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">State Jurisdiction</label>
                  <button
                    type="button"
                    onClick={() => setEditStateDropdownOpen(!editStateDropdownOpen)}
                    className="bg-[#F5F7FA] border border-[#DDE3EA] hover:border-[var(--accent-primary)]/40 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--accent-primary)] font-semibold flex justify-between items-center w-full shadow-sm text-left transition-all"
                  >
                    <span>{editingRecord.state || '-- Select State --'}</span>
                    <span className="text-slate-400 text-[10px]">▼</span>
                  </button>

                  {editStateDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setEditStateDropdownOpen(false)} />
                      <div 
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DDE3EA] rounded-xl shadow-xl z-40 max-h-60 overflow-y-auto p-2.5 space-y-1 animate-fadeIn"
                        style={{ minWidth: '200px' }}
                      >
                        <input
                          type="text"
                          placeholder="Search state..."
                          value={editStateSearch}
                          onChange={(e) => setEditStateSearch(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#F5F7FA] border border-[#DDE3EA] rounded-lg text-xs focus:outline-none focus:border-[var(--accent-primary)] mb-2 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRecord({...editingRecord, state: ''});
                            setEditStateDropdownOpen(false);
                            setEditStateSearch('');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-[#F5F7FA]"
                        >
                          -- None --
                        </button>
                        {INDIAN_STATES
                          .filter(s => s.toLowerCase().includes(editStateSearch.toLowerCase()))
                          .map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                setEditingRecord({...editingRecord, state: s});
                                setEditStateDropdownOpen(false);
                                setEditStateSearch('');
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${editingRecord.state === s ? 'bg-[var(--accent-glow)] text-[var(--accent-primary)] font-bold' : 'text-slate-700 hover:bg-[#F5F7FA] transition-colors'}`}
                            >
                              {s}
                            </button>
                          ))
                        }
                      </div>
                    </>
                  )}
                </div>

                {/* District/City */}
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">District / City</label>
                  <input
                    type="text"
                    value={editingRecord.district || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, district: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Age</label>
                  <input
                    type="Number"
                    value={editingRecord.age || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, age: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Date of Workshop</label>
                  <input
                    type="date"
                    value={editingRecord.date_of_workshop || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, date_of_workshop: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Father Name</label>
                  <input
                    type="text"
                    value={editingRecord.father_name || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, father_name: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Gender</label>
                  <select
                    value={editingRecord.gender || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, gender: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800 mt-2"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Aadhaar Card no.</label>
                  <input
                    type="text"
                    value={editingRecord.identity_card_no || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, identity_card_no: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Certificate Recieved</label>
                  
                  <select
                    value={editingRecord.has_certificate|| ''}
                    onChange={(e) => setEditingRecord({...editingRecord, has_certificate: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800 mt-2"
                  >
                    <option>--Select Option --</option>
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Insurance Enrolled</label>
                  
                  <select
                    value={editingRecord.insurance_enrolled || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, insurance_enrolled: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800 mt-2"
                  >
                    <option>--Select Option --</option>
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Marital Status</label>
                  
                  <select
                    value={editingRecord.marital_status || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, marital_status: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800 mt-2"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Mobile no.</label>
                  <input
                    type="tel"
                    value={editingRecord.mobile_no || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, mobile_no: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Nominee DOB</label>
                  <input
                    type="date"
                    value={editingRecord.nominee_dob || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, nominee_dob: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Nominee Gender</label>
                  <select
                    value={editingRecord.gender || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, nominee_gender: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800 mt-2"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Nominee Mobile no.</label>
                  <input
                    type="tel"
                    value={editingRecord.nominee_mobile_no || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, nominee_mobile_no: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Nominee Name</label>
                  <input
                    type="text"
                    value={editingRecord.nominee_name || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, nominee_name: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Nominee relationship</label>
                  <input
                    type="text"
                    value={editingRecord.relationship_with_participant || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, relationship_with_participant: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Nominee relationship</label>
                  <input
                    type="text"
                    value={editingRecord.relationship_with_participant || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, relationship_with_participant: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Religion</label>
                  <input
                    type="text"
                    value={editingRecord.religion || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, religion: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Training Location</label>
                  <input
                    type="text"
                    value={editingRecord.training_location || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, training_location: e.target.value})}
                    className="w-full bg-[#F5F7FA] border border-[#DDE3EA] focus:border-[var(--accent-primary)]/60 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#DDE3EA]">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="btn-frosted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {verifyModalRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDE3EA] max-w-5xl w-full rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
            <button
              type="button"
              onClick={() => setVerifyModalRecord(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 flex items-center justify-center"
            >
              <X size={18} />
            </button>

            <div className="border-b border-[#DDE3EA] pb-4 mb-6">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Identity Verification
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mt-2">
                Review identity document
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="rounded-2xl border border-[#DDE3EA] bg-[#F8FAFC] p-4 flex items-center justify-center min-h-[360px]">
                {verifyImageUrl ? (
                  <img
                    src={verifyImageUrl}
                    alt="Identity document"
                    className="max-h-[360px] w-full object-contain rounded-xl"
                  />
                ) : verifyModalRecord.id_link ? (
                  <div className="text-center text-slate-400 text-sm">
                    Loading image...
                  </div>
                ) : (
                  <div className="text-center text-slate-400 text-sm">
                    No identity image available for this record.
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#DDE3EA] bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Full Name</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{verifyModalRecord.full_name || verifyModalRecord.aadhar_name || 'Not available'}</p>
                  </div>
                  <div className="rounded-2xl border border-[#DDE3EA] bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">ID Number</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{verifyModalRecord.id_no || 'Not available'}</p>
                  </div>
                  <div className="rounded-2xl border border-[#DDE3EA] bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Date of Birth</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{verifyModalRecord.date_of_birth ? formatDate(verifyModalRecord.date_of_birth) : 'Not available'}</p>
                  </div>
                  <div className="rounded-2xl border border-[#DDE3EA] bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Address</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{verifyModalRecord.address || 'Not available'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmVerification}
                  disabled={isVerifying || verifyModalRecord.isVerified}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--accent-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                >
                  {isVerifying ? 'Verifying...' : verifyModalRecord.isVerified ? 'Already Verified' : 'Verify Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vault Details Decryption Modal */}
      {activeVaultRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDE3EA] max-w-4xl w-full rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
            <button 
              onClick={() => setActiveVaultRecord(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 flex items-center justify-center"
            >
              <X size={18} />
            </button>
            
            <div className="border-b border-[#DDE3EA] pb-4 mb-6">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Vault Record Decrypted
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mt-2">
                {activeVaultRecord.nameOfCarpenter || 'Unnamed Carpenter'}
              </h3>
              <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-medium">
                Detailed Enrollment & Metadata Vault Dossier
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {VAULT_FIELDS.map((f) => (
                <div key={f.key} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl shadow-xs">
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">
                    {f.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-800 mt-1 block">
                    {activeVaultRecord[f.key] || <span className="text-slate-300 italic font-normal text-xs">Not Entered</span>}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#DDE3EA] mt-8">
              <button
                type="button"
                onClick={() => {
                  setEditingRecord(activeVaultRecord);
                  setActiveVaultRecord(null);
                }}
                className="btn-gold text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit size={13} />
                <span>Edit Vault Dossier</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveVaultRecord(null)}
                className="btn-frosted text-xs font-semibold"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
