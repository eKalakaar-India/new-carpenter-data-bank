import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "../validations/user.schema";
import { 
  FileUp, 
  Map, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Trash2, 
  ArrowRight,
  Database,
  RefreshCw,
  Sparkles,
  Pencil,
  Search, 
  Plus
} from 'lucide-react';


const COLORS = {
  primary: "#851C2C",
  sky: "#0284C7",
  teal: "#0D9488",
  amber: "#EAB308",
  purple: "#8B5CF6",
  emerald: "#10B981",
  rose: "#F43F5E",
};

const roleColors = {
  Super_Admin:
    "bg-red-100 text-red-700",

  Operation_Head:
    "bg-sky-100 text-sky-700",

  Project_Head:
    "bg-violet-100 text-violet-700",

  Mobilizer:
    "bg-emerald-100 text-emerald-700",
};

export default function Ingest( isProjectHead ) {
  const { 
    user,
    userBase,
    userBaseLoading,
    fetchUsers,
    blockUser,
    deleteRecord,
    signup
  } = useVaultStore();

  const [isAdduser, setIsAddUser] = useState(false);
  const [isEdituser, setIsEditUser] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  // const [userBase, setUserBase] = useState([]);

  const fetchAllUsers = async() =>{
    await fetchUsers()
    console.log(userBase);
  }

  useEffect(()=>{
    
    fetchAllUsers()
  }, [])


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const onSubmit = async (data) => {
    // console.log(user.role);
     await signup(data.name, data.email, data.password, data.role)
    // await api.post("/users", data);

    reset();
  };

  const handleBlock = async (userId) => {
    // console.log(userId)
    await blockUser(userId)
  }

  const handleDelete = async (userId) => {
    await deleteRecord(userId)
  }


  const filteredUsers = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return userBase.filter((user) => {
        const matchesSearch =
          !searchTerm ||
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm);

        const matchesRole =
          roleFilter === "ALL" || user.role === roleFilter;

        return matchesSearch && matchesRole;
      });
  }, [userBase, search, roleFilter]);
  

  return (
    <>
    {
      user.role === "Operation Head" &&(
        <div className='text-slate-800 text-2xl font-semibold flex items-center justify-center h-screen'>
        👤  Not Authorised....
        </div>
      )
    }
    <div className="space-y-8 pb-10 text-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        {/* Left Section */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{
                "--tw-ring-color": COLORS.sky,
              }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2"
            style={{
              "--tw-ring-color": COLORS.purple,
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="OPERATION_HEAD">Operation Head</option>
            <option value="PROJECT_HEAD">Project Head</option>
            <option value="MOBILIZER">Mobilizer</option>
          </select>

        </div>

        {/* Add User Button */}
        <button
          onClick={() => setIsAddUser(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-white font-semibold shadow-lg transition hover:opacity-90"
          style={{
            backgroundColor: COLORS.primary,
          }}
        >
          <Plus size={18} />
          Add User
        </button>

      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <table className="min-w-full divide-y divide-slate-200 p-4">
          <thead className="bg-slate-50 h-2 p-4">
            <tr className='text-slate-800 text-lg font-semibold border-r border-[#DDE3EA]'>
              <th className='p-3'>Name</th>
              <th className='p-3'>Email</th>
              <th className='p-3'>Role</th>
              <th className='p-3'>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map(user => (
              <tr className=' text-center border-r border-t-[#DDE3EA] text-lg font-semibold ' key={user.id}>
                <td className='p-4 '>{user.name}</td>
                <td className='p-4 '>{user.email}</td>

                <td>
                  {/* <RoleBadge role={user.role}/> */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role.replace(" ", "_")]}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className='flex flex-col gap-4 justify-center items-center p-4'>
                  <button onClick={()=>handleBlock(user.id)} disabled={user.isBlocked} className="w-2/3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    {user.isBlocked ? "Blocked" : "Block"}
                  </button>
                  {/* <button onClick={()=>handleDelete(user.id)} className="w-2/3 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-red-600 transition">
                    Delete
                  </button> */}
                  {/* <div className='flex gap-4 justify-center items-center p-4'>
                    <button o>
                      <Trash2 size={18}/>
                    </button>
                  </div> */}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
      {
        isAdduser &&(
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>

            <div className=" relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl space-y-8 p-6 text-slate-800">
              
              {/* Title */}
              <div className='flex items-center justify-between rounded-t-3xl px-6 py-5 text-white'>
                <h2 className="font-serif text-3xl font-bold tracking-wide text-slate-900">
                  Create a User 
                </h2>
                  <button
                    onClick={() => setIsAddUser(false)}
                    className="text-2xl text-black font-bold hover:opacity-80"
                  >
                    ×
                  </button>
              </div>

              <div className="flex justify-center w-full">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-8 space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="John Doe"
                      {...register("name")}
                      className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                        errors.name
                          ? "border-red-500"
                          : "border-slate-300"
                      }`}
                      style={{
                        "--tw-ring-color": COLORS.sky,
                      }}
                    />

                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="john@example.com"
                      {...register("email")}
                      className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-500"
                          : "border-slate-300"
                      }`}
                      style={{
                        "--tw-ring-color": COLORS.sky,
                      }}
                    />

                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="********"
                      {...register("password")}
                      className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                        errors.password
                          ? "border-red-500"
                          : "border-slate-300"
                      }`}
                      style={{
                        "--tw-ring-color": COLORS.teal,
                      }}
                    />

                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      User Role
                    </label>

                    <select
                      {...register("role")}
                      className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                        errors.role
                          ? "border-red-500"
                          : "border-slate-300"
                      }`}
                      style={{
                        "--tw-ring-color": COLORS.purple,
                      }}
                    >
                      <option value="">Select Role</option>
                      {
                        isProjectHead ? 
                            <option value="Project Head">Project Head</option> : <></>
                      }
                      <option value="Operation Head">Operation Head</option>
                      <option value="Mobilizer">Mobilizer</option>
                    </select>

                    {errors.role && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.role.message}
                      </p>
                    )}
                  </div>

                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl text-white font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: COLORS.primary,
                    }}
                  >
                    {isSubmitting ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
              </div>
            </div>

          </div>
        )
      }
    </>
  );
}
