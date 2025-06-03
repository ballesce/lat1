"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Link from "next/link";

export default function KelolaUKM() {
  const router = useRouter();
  const [ukms, setUkms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ambil data UKM dari Firestore
  useEffect(() => {
    const fetchUkms = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "ukms"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUkms(data);
      } catch (error) {
        console.error("Error fetching UKM data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUkms();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus UKM ini?")) {
      try {
        await deleteDoc(doc(db, "ukms", id));
        setUkms(ukms.filter(ukm => ukm.id !== id));
        alert("UKM berhasil dihapus");
      } catch (error) {
        console.error("Error deleting UKM:", error);
        alert("Gagal menghapus UKM");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Tombol Kembali */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/admin")}

          className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L4.414 9H17a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali
        </button>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kelola Unit UKM</h1>
          <p className="text-gray-500 mt-1">Manajemen Unit Kegiatan Mahasiswa</p>
        </div>
        <Link
          href="/admin/ukm/tambah"
          className="mt-4 md:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah UKM
        </Link>
      </header>

      {/* Tabel UKM */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Daftar UKM</h2>
          <div className="text-sm text-gray-500">
            Total: {ukms.length} UKM
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-sm font-medium uppercase tracking-wider">
                  <th className="p-4">No</th>
                  <th className="p-4">Nama UKM</th>
                  <th className="p-4">Pembina</th>
                  <th className="p-4">Jumlah Anggota</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ukms.length > 0 ? (
                  ukms.map((ukm, index) => (
                    <tr key={ukm.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-700 font-medium">{index + 1}</td>
                      <td className="p-4 font-medium text-gray-800">{ukm.nama}</td>
                      <td className="p-4 text-gray-600">{ukm.pembina || '-'}</td>
                      <td className="p-4 text-gray-600">{ukm.jumlahAnggota || 0}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          ukm.status === "Aktif"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {ukm.status || 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/ukm/edit/${ukm.id}`}
                          className="text-blue-600 hover:text-blue-800 transition p-1"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(ukm.id)}
                          className="text-red-600 hover:text-red-800 transition p-1 ml-2"
                          title="Hapus"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      Tidak ada data UKM
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
