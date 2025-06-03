"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function AdminDashboard() {
  const router = useRouter();

  const [ukms, setUkms] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch UKM data
        const ukmsSnapshot = await getDocs(collection(db, "ukms"));
        const ukmsData = ukmsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUkms(ukmsData);

        // Fetch student count
        const q = query(
          collection(db, "users"),
          where("role", "==", "mahasiswa")
        );
        const querySnapshot = await getDocs(q);
        setTotalStudents(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Selamat datang di panel admin Sistem Informasi UKM</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total UKM</h2>
              <p className="text-3xl font-bold text-gray-800 mt-1">{ukms.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">+{ukms.filter(u => u.status === "Aktif").length} UKM aktif</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Mahasiswa Aktif</h2>
              <p className="text-3xl font-bold text-gray-800 mt-1">{totalStudents}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {ukms.reduce((sum, ukm) => sum + (ukm.jumlahAnggota || 0), 0)} total anggota UKM
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Kegiatan Aktif</h2>
              <p className="text-3xl font-bold text-gray-800 mt-1">5</p>
            </div>
            <div className="p-3 rounded-full bg-orange-50 text-orange-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">2 kegiatan hari ini</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <a href="/admin/ukm" className="group flex items-center gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-500">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">Manajemen UKM</h3>
            <p className="text-sm text-gray-500">Kelola unit kegiatan mahasiswa</p>
          </div>
        </a>
        
        <a href="/admin/mahasiswa" className="group flex items-center gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-green-500">
          <div className="p-3 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition">Data Mahasiswa</h3>
            <p className="text-sm text-gray-500">Kelola data anggota UKM</p>
          </div>
        </a>
        
        <a href="#" className="group flex items-center gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-orange-500">
          <div className="p-3 rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition">Jadwal Kegiatan</h3>
            <p className="text-sm text-gray-500">Atur jadwal kegiatan UKM</p>
          </div>
        </a>
      </section>

      {/* UKM Table */}
<section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
    <h2 className="text-xl font-bold text-gray-800">Daftar UKM</h2>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 text-left text-gray-500 text-sm font-medium uppercase tracking-wider">
          <th className="p-4">No</th>
          <th className="p-4">Nama UKM</th>
          <th className="p-4">Pembina</th>
          <th className="p-4">Anggota</th>
          <th className="p-4">Status</th>
          {/* Aksi column dihapus */}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {ukms.map((ukm, index) => (
          <tr key={ukm.id} className="hover:bg-gray-50 transition">
            <td className="p-4 text-gray-700 font-medium">{index + 1}</td>
            <td className="p-4">
              <div className="font-medium text-gray-800">{ukm.nama}</div>
              <div className="text-sm text-gray-500">{ukm.deskripsi || "Tidak ada deskripsi"}</div>
            </td>
            <td className="p-4 text-gray-600">{ukm.pembina || "-"}</td>
            <td className="p-4 text-gray-600">{ukm.jumlahAnggota || 0}</td>
            <td className="p-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                ukm.status === "Aktif" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {ukm.status || "Tidak diketahui"}
              </span>
            </td>
            {/* Kolom aksi dihapus */}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
    <div>Menampilkan 1-{ukms.length} dari {ukms.length} UKM</div>
    <div className="flex gap-2">
      <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 transition">Sebelumnya</button>
      <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition">1</button>
      <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 transition">Selanjutnya</button>
    </div>
  </div>
</section>

    </div>
  );
}