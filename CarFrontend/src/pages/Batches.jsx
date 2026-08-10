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
import CreateBatchModal from "../Component/CreateBatchModal";
import statesData from "../constants/StateDistrictData.json";


export default function Records() {
  const { 
    records, 
    batchTable,
    recordsLoading, 
    userMobilisers,
    pagination, 
    createBatch,
    updateBatch,
    filters, 
    aggregates,
    fetchBatches, 
    fetchMobilisers,
    setFilters, 
    deleteBatch,
    deleteRecord, 
    bulkDeleteRecords,
    updateRecord,
    deduplicateRecords,
    uploadDocument,
    deleteRecordParticipant,
    updateCompletedBatch,
    resolveStorageFileUrl,
  } = useVaultStore();

  const [selectedIds, setSelectedIds] = useState([]);
  const [resolvedBatchImages, setResolvedBatchImages] = useState({});
  const [editingRecord, setEditingRecord] = useState(null);
  const [activeVaultRecord, setActiveVaultRecord] = useState(null);
  
  const [searchVal, setSearchVal] = useState(filters.search);
  const [ editVals, setEditVals] = useState(null);
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
  const [open, setOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);


  const handleCreateBatch = async(data) => {
    console.log(data);
    let res = await createBatch(data);
    if(res){
      alert('Batch Created!')
      fetchBatches(1);
    }else{
      alert("Batch could not be created.")
    }
    setOpen(false);
  };




  const handleUpdateBatch = async (data) => {
    console.log(data);

    const imageFiles = Array.isArray(data.batch_img)
      ? data.batch_img.filter((item) => item instanceof File)
      : [];
    const videoFile = data.batch_video instanceof File ? data.batch_video : null;
    const hasMedia = imageFiles.length > 0 || !!videoFile;

    if (hasMedia) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value == null || value === "") return;

        switch (key) {
          case "batch_img":
            value.forEach((file) => {
              if (file instanceof File) {
                formData.append("batch_img", file);
              }
            });
            break;

          case "batch_video":
            if (value instanceof File) {
              formData.append("batch_video", value);
            }
            break;

          default:
            formData.append(key, value);
        }
      });

      const res = await updateCompletedBatch(formData, data.id);
      if (res) {
        alert('Batch Updated!');
        fetchBatches(1);
      } else {
        alert('Batch could not be updated.');
      }
    } else {
      const res = await updateBatch(data);
      if (res) {
        alert('Batch Updated!');
        fetchBatches(1);
      } else {
        alert('Batch could not be updated.');
      }
    }
    setOpen(false);
  };

  const openImageViewer = (images, startIndex) => {
    setImageViewerImages(images);
    setImageViewerIndex(startIndex);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setImageViewerImages([]);
    setImageViewerIndex(0);
  };

  const showPreviousImage = () => {
    setImageViewerIndex((prev) => Math.max(0, prev - 1));
  };

  const showNextImage = () => {
    setImageViewerIndex((prev) => Math.min(imageViewerImages.length - 1, prev + 1));
  };

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
    fetchBatches(1);
  }, []);

  useEffect(()=>{
    fetchMobilisers();
  },[])

  useEffect(() => {
    const fetchSignedUrls = async () => {
      const newUrls = {};
      const missingPaths = batchTable.flatMap((rec) =>
        (Array.isArray(rec.batch_img) ? rec.batch_img : []).filter((path) =>
          path && !path.startsWith('http') && !resolvedBatchImages[path]
        )
      ).filter(Boolean);

      if (missingPaths.length === 0) {
        return;
      }

      const uniquePaths = [...new Set(missingPaths)];

      await Promise.all(
        uniquePaths.map(async (path) => {
          try {
            const resolved = await resolveStorageFileUrl(path);
            if (resolved) {
              newUrls[path] = resolved;
            }
          } catch (err) {
            console.error('Error resolving storage URL for batch image:', path, err);
          }
        })
      );

      if (Object.keys(newUrls).length > 0) {
        setResolvedBatchImages((current) => ({ ...current, ...newUrls }));
      }
    };

    if (batchTable.length > 0) {
      fetchSignedUrls();
    }
  }, [batchTable, resolvedBatchImages, resolveStorageFileUrl]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters({ search: searchVal });
      fetchBatches(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVal]);

  const handleFilterChange = (key, val) => {
    setFilters({ [key]: val });
    fetchBatches(1);
  };

  const handlePageChange = (newPage) => {
    fetchBatches(newPage);
  };

  function formatDate(dateString) {
    const date = new Date(dateString);

    return `${date.getDate().toString().padStart(2, "0")} ${
      date.toLocaleString("en-US", { month: "short" })
    }, ${date.getFullYear()}`;
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(batchTable.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e, id) => {
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
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

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to clear this entry?')) {
      await deleteBatch(id);
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

  const openModal = (datapt)=>{
    setOpen(true)
    setEditVals(datapt)
  }

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
  

  return (
    <div className="space-y-6 pb-10 text-slate-800">
      <CreateBatchModal
        isOpen={open}
        onClose={() => {setOpen(false) 
          setEditVals(null)
        }}
        onSubmit={editVals?.workshop_date ? handleUpdateBatch : handleCreateBatch}
        initialData={editVals}
      />

      {/* Unified batch create / edit modal */}
      {/* No separate upload modal needed after integration. */}

      {/* Table Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-slate-900">
            Batches
          </h2>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-medium">
            Search, sort, filter, and extract data from active records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            className="btn-gold text-sm font-semibold"
            onClick={() => openModal()}
          >
            <span>Create Batch</span>
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

        {/* {selectedIds.length > 0 && (
          // <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 shadow-sm">
          //   <span>Selected {selectedIds.length} Entries</span>
          //   <button 
          //     onClick={handleBulkDelete}
          //     className="p-1.5 hover:bg-red-100 rounded-lg border border-red-200 hover:text-red-700 transition-colors"
          //   >
          //     <Trash2 size={14} />
          //   </button>
          // </div>
        )} */}
      </div>

      {/* Dynamic Filters Area (Horizontal Grid above the table) */}
      <div className="vault-card !overflow-visible grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-[#DDE3EA]">
        {/* Category */}

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
                    handleFilterChange("state", "");
                    handleFilterChange("district", "");
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
              fetchBatches(1);
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
              <table className="vault-table min-w-[1600px]">
              <thead>
                <tr>
                  <th className="w-2 text-center sticky left-0 bg-[#E8ECF2] z-20 border-r border-[#DDE3EA]">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={batchTable.length > 0 && selectedIds.length === batchTable.length}
                      className="rounded border-[#DDE3EA] bg-white text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20 h-4 w-4"
                    />
                  </th>
                  <th className="w-4">Sr No</th>
                  {/* <th className="w-36">Candidate Number</th> */}
                  <th className="w-4">Batch ID</th>
                  <th className="w-4">Trainer Name</th>
                  <th className="w-4">Trainer Phone no.</th>
                  <th className="w-4">Workshop Date</th>
                  <th className="w-4">Status</th>
                  <th className="w-4">Batch Images / videos</th>
                  <th className="w-4">State</th>
                  <th className="w-4">District</th>
                  <th className="w-4">Location</th>
                  <th className="w-4">Full Address</th>
                  <th className="w-4">Mobiliser Name</th>
                  <th className="w-4 text-center sticky right-0 bg-[#E8ECF2] z-20 border-l border-[#DDE3EA]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batchTable.map((rec, index) => (
                  <tr 
                     key={rec.id} 
                     className={selectedIds.includes(rec.id) ? 'bg-[var(--accent-glow)]' : ''}
                  >
                    <td className="text-center border-r border-[#DDE3EA]">
                      <input 
                        type="checkbox" 
                        onChange={(e) => handleSelectRow(e, rec.id)}
                        checked={selectedIds.includes(rec.id)}
                        className="rounded border-[#DDE3EA] bg-white text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20 h-4 w-4"
                      />
                    </td>
                    <td className="font-semibold text-[var(--accent-primary)]">{index + 1 || '-'}</td>
                    <td className="text-xs text-slate-600">{rec.batch_id}</td>
                    <td className="font-serif font-bold text-slate-900 text-sm">{rec.trainer_name || '-'}</td>
                    <td className="font-serif font-bold text-slate-900 text-sm">{rec?.trainer_phoneno || '-'}</td>
                    <td className="text-xs text-slate-700">{formatDate(rec.workshop_date)|| '-'}</td>
                    <td className={`text-xs text-slate-700 ${rec.status === 'COMPLETED' ? 'text-green-500' : 'text-red-500'}`}>{rec.status|| '-'}</td>
                    <td className="text-xs text-slate-700">
                      {Array.isArray(rec?.batch_img) && rec.batch_img.length > 0 ? (
                        (() => {
                          const imageUrls = rec.batch_img.map((img) => img.startsWith('http') ? img : resolvedBatchImages[img] || img);
                          return imageUrls.map((src, index) => (
                            <button
                              key={`${rec.id}-${index}`}
                              type="button"
                              onClick={() => openImageViewer(imageUrls, index)}
                              className="inline-block rounded overflow-hidden border border-[#DDE3EA] mr-2 mb-2"
                            >
                              <img src={src} alt={`Batch ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                            </button>
                          ));
                        })()
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="text-xs text-slate-600 font-mono">{rec.state || '-'}</td>
                    <td className="text-xs text-slate-600">{rec.district || '-'}</td>
                    <td className="text-xs text-slate-600">{rec.city_town || '-'}</td>
                    <td className="text-xs text-slate-600">{rec.full_address || '-'}</td>
                    <td className="text-xs text-slate-600">{rec.mobiliser.name || '-'}</td>
                    <td className="text-center sticky right-0 z-10 border-l border-[#DDE3EA] sticky-col">
                      <div className="inline-flex items-center gap-2">
                        {rec?.status === 'COMPLETED' && Array.isArray(rec.batch_img) && rec.batch_img.length > 0 ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                            Batch finished
                          </span>
                        ) : (
                          <button 
                            onClick={() => openModal(rec)}
                            className="inline-flex items-center justify-center rounded-lg border border-[#DDE3EA] bg-white px-3 py-2 text-slate-700 hover:bg-[#F5F7FA] hover:text-[var(--accent-primary)] transition-colors"
                          >
                            <Edit size={14} className="mr-1" />
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {batchTable.length === 0 && (
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

      {imageViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-slate-100 px-4 py-3">
            
              <span className="text-sm font-semibold text-slate-700">Batch image {imageViewerIndex + 1} of {imageViewerImages.length}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={showPreviousImage}
                  disabled={imageViewerIndex === 0}
                  className="rounded-full border border-[#DDE3EA] bg-white px-3 py-2 text-slate-700 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  disabled={imageViewerIndex === imageViewerImages.length - 1}
                  className="rounded-full border border-[#DDE3EA] bg-white px-3 py-2 text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
              <button
                type="button"
                onClick={closeImageViewer}
                className="rounded-full bg-white p-2 text-slate-600 shadow-md hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex min-h-[320px] items-center justify-center bg-slate-900 p-4">
              <img
                src={imageViewerImages[imageViewerIndex]}
                alt={`Batch large ${imageViewerIndex + 1}`}
                className="max-h-[70vh] w-full max-w-full rounded-3xl object-contain"
              />
            </div>
          </div>
        </div>
      )}

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
