import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:4100').replace(/\/$/, '');
axios.defaults.baseURL = API_BASE_URL;

const normalizeApiResponse = (payload) => payload?.data ?? payload;
const getErrorMessage = (error) => error?.response?.data?.message || error?.response?.data?.errors?.[0]?.message || error?.response?.data?.error || 'Request failed';

// Helper to set headers
const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Check local storage
const cachedToken = localStorage.getItem('vault_token');
const cachedUser = localStorage.getItem('vault_user') ? JSON.parse(localStorage.getItem('vault_user')) : {};
if (cachedToken) {
  setAuthHeader(cachedToken);
}

export const useVaultStore = create((set, get) => ({
  // Auth state
  token: cachedToken,
  user: cachedUser,
  isAuthenticated: !!cachedToken,
  authError: null,
  authLoading: false,
  // Records state
  records: [],
  recordsLoading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
  filters: {
    search: '',
    category: '',
    state: '',
    sortBy: 'srNo',
    sortOrder: 'asc'
  },
  aggregates: {
    categories: [],
    states: []
  },

  userBase:[],
  userBaseLoading:false,
    // Import state
  uploadPreview: null,
  uploadLoading: false,
  uploadError: null,
  importHistory: [],
  activityLogs: [],

  // Analytics state
  analyticsData: null,
  analyticsLoading: false,

  // AUTH ACTIONS
  login: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const payload = normalizeApiResponse(response.data);
      const token = payload?.token;
      const user = payload?.user;

      if (!token) {
        throw new Error('No authentication token returned by the server.');
      }

      localStorage.setItem('vault_token', token);
      localStorage.setItem('vault_user', JSON.stringify(user || {}));
      setAuthHeader(token);
      set({ token, user: user || null, isAuthenticated: true, authLoading: false });
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ authError: message, authLoading: false });
      return false;
    }
  },

  signup: async (name, email, password, role) => {
    set({ authLoading: true, authError: null });
    try {
      await axios.post('/api/auth/register', { name, email, password, role });
      // return get().login(email, password);

    } catch (error) {
      const message = getErrorMessage(error);
      set({ authError: message, authLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('vault_token');
    localStorage.removeItem('vault_user');
    setAuthHeader(null);  
    set({ token: null, user: null, isAuthenticated: false, uploadPreview: null });
    return true
  },

  blockUser: async(userId)=>{
    try {
      await axios.patch(`/api/auth/block-user/${userId}`);
      // get().fetchUsers();
    } catch (error) {
      console.error('Failed to Block users:', error);
    }
  },

  // RECORD ACTIONS
  fetchRecords: async (page = 1, forceFilters = {}) => {
    set({ recordsLoading: true });
    try {
      const activeFilters = { ...get().filters, ...forceFilters };
      const response = await axios.get('/api/carpenters', {
        params: {
          page,
          pageSize: activeFilters.limit || 20,
          search: activeFilters.search,
          category: activeFilters.category,
          state: activeFilters.state,
          // sort: activeFilters.sortBy ? `${activeFilters.sortBy},${activeFilters.sortOrder}` : undefined,
        }
      });

      console.log(response.data);

      const payload = normalizeApiResponse(response.data);
      const items = payload?.items ?? payload?.records ?? [];
      const paginationData = payload?.pagination ?? {};

      set({
        records: items,
        pagination: {
          total: paginationData.total ?? items.length,
          page: paginationData.page ?? page,
          limit: paginationData.pageSize ?? activeFilters.limit ?? 20,
          totalPages: paginationData.totalPages ?? 1,
        },
        aggregates: payload?.aggregates ?? { categories: [], states: [] },
        recordsLoading: false,
        filters: activeFilters
      });
    } catch (error) {
      set({ recordsLoading: false });
      console.error('Failed to load partnership vault entries:', error);
    }
  },

  fetchUsers: async ()=>{
    try {
      set({userBaseLoading:true})
      const response = await axios.get('/api/auth/allusers');
      const payload = normalizeApiResponse(response.data);
      set({ userBase: payload, userBaseLoading:false });

    } catch (error) {
      console.error('Failed to load users:', error);
      set({ userBase: [], userBaseLoading:false });
      
    }
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  addRecord: async (recordData) => {
    try {
      const payload = {
        aadhar_name: recordData.name,
        mobile_no: recordData.mobile_number,
        identity_card_no: recordData.aadhaar_number,
        age: recordData.age,
        date_of_birth: recordData.dob,
        gender: recordData.gender,
        address: recordData.address,
        district: recordData.district,
        state: recordData.state,
        pin: recordData.pincode,
        nominee_name: recordData.nom_name,
        nominee_gender: recordData.nom_gender,
        nominee_dob: recordData.nom_dob,
        relationship_with_participant: recordData.nom_relationship,
        nominee_mobile_no: recordData.nom_mobile,
        father_name: recordData.fathername,
        marital_status:recordData.marital_status,
        religion: recordData.religion
      };
      console.log(payload);

      const response = await axios.post('/api/carpenters', payload);
      const normalized = normalizeApiResponse(response.data);
      set((state) => ({
        records: [normalized, ...state.records],
        pagination: { ...state.pagination, total: state.pagination.total + 1 }
      }));
      return normalized;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  updateRecord: async (id, updatedData) => {
    try {
      const response = await axios.put(`/api/records/${id}`, updatedData);
      const normalized = normalizeApiResponse(response.data);
      set((state) => ({
        records: state.records.map(rec => rec.id === id ? normalized : rec)
      }));
      return normalized;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  deleteRecordParticipant: async(id)=>{
    try {
      await axios.delete(`/api/records/${id}`);
      return true;
    } catch (error) {
      console.error('Delete record failed:', error);
      return false;
    }
  },

  deleteRecord: async (id) => {
    try {
      await axios.delete(`/api/auth/delete/${id}`);
      return true;
    } catch (error) {
      console.error('Delete record failed:', error);
      return false;
    }
  },

  bulkDeleteRecords: async (ids) => {
    try {
      await axios.post('/records/bulk-delete', { ids });
      get().fetchRecords(1);
      return true;
    } catch (error) {
      console.error('Bulk delete failed:', error);
      return false;
    }
  },

  deduplicateRecords: async () => {
    try {
      const response = await axios.post('/records/deduplicate');
      get().fetchRecords(1);
      return response.data;
    } catch (error) {
      console.error('Deduplication failed:', error);
      throw new Error(error.response?.data?.error || 'Deduplication failed.');
    }
  },

  uploadDocument: async (recordId, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    try {
      const response = await axios.post(`/records/${recordId}/upload-document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Refetch records to get updated document path
      get().fetchRecords(get().pagination.page);
      return response.data.path;
    } catch (error) {
      console.error('Document upload failed:', error);
      throw new Error(error.response?.data?.error || 'Document upload failed.');
    }
  },

  // UPLOAD & INGESTION ACTIONS
  uploadFilePreview: async (file) => {
    set({ uploadLoading: true, uploadError: null, uploadPreview: null });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/upload/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      set({ uploadPreview: response.data, uploadLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Spreadsheet ingestion failed.';
      set({ uploadError: errorMsg, uploadLoading: false });
      return null;
    }
  },

  importFileFinal: async (filePath, mapping, fileName) => {
    set({ uploadLoading: true });
    try {
      const response = await axios.post('/upload/import', { filePath, mapping, fileName });
      set({ uploadPreview: null, uploadLoading: false });
      get().fetchRecords(1);
      return response.data;
    } catch (error) {
      set({ uploadLoading: false });
      throw new Error(error.response?.data?.error || 'Final import mapping failed.');
    }
  },

  fetchImportHistory: async () => {
    try {
      const response = await axios.get('/imports');
      set({ importHistory: response.data });
    } catch (error) {
      console.error('Failed to load upload history logs:', error);
    }
  },

  // SYSTEM LOGS & ANALYTICS ACTIONS
  fetchAnalytics: async () => {
    set({ analyticsLoading: true });
    try {
      const response = await axios.get('/api/dashboard');
      // console.log(response.data.data);
      set({ analyticsData: response.data.data, analyticsLoading: false });
    } catch (error) {
      set({ analyticsLoading: false });
      console.error('Failed to fetch analytics statistics:', error);
    }
  },

  fetchActivityLogs: async () => {
    try {
      const response = await axios.get('/activity-logs');
      set({ activityLogs: response.data });
    } catch (error) {
      console.error('Failed to fetch admin security trails:', error);
    }
  }
}));
