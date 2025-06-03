"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

export default function DashboardDosen() {
  const [userData, setUserData] = useState(null);
  const [ukmData, setUkmData] = useState(null); // Data UKM yang dibina oleh dosen ini
  const [anggotaUkm, setAnggotaUkm] = useState([]);
  const [agendaUkm, setAgendaUkm] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          if (data.role !== "pembina") {
            router.push("/login");
          } else {
            setUserData({
              name: data.name,
              email: user.email,
              role: data.role,
              pembinaId: user.uid
            });

            // 1. Ambil data UKM yang dibina oleh dosen ini
            const ukmQuery = query(
              collection(db, "ukms"),
              where("pembinaId", "==", user.uid)
            );
            
            const ukmSnapshot = await getDocs(ukmQuery);
            if (!ukmSnapshot.empty) {
              const ukmDoc = ukmSnapshot.docs[0];
              const ukm = { id: ukmDoc.id, ...ukmDoc.data() };
              setUkmData(ukm);

              // 2. Ambil anggota UKM ini
              const anggotaQuery = query(
                collection(db, "users"),
                where("ukm", "==", ukm.nama),
                where("role", "==", "mahasiswa")
              );
              
              const anggotaSnapshot = await getDocs(anggotaQuery);
              const anggotaList = [];
              anggotaSnapshot.forEach((doc) => {
                anggotaList.push({ id: doc.id, ...doc.data() });
              });
              setAnggotaUkm(anggotaList);

              // 3. Ambil agenda UKM ini (jika collection agenda ada)
              try {
                const agendaQuery = query(
                  collection(db, "agenda"),
                  where("ukm", "==", ukm.nama)
                );
                
                const agendaSnapshot = await getDocs(agendaQuery);
                const agendaList = [];
                agendaSnapshot.forEach((doc) => {
                  agendaList.push({ id: doc.id, ...doc.data() });
                });
                setAgendaUkm(agendaList);
              } catch (error) {
                console.log("Collection agenda tidak ditemukan");
              }

              // 4. Ambil notifikasi untuk UKM ini (jika collection notifikasi ada)
              try {
                const notifQuery = query(
                  collection(db, "notifikasi"),
                  where("ukm", "==", ukm.nama)
                );
                
                const notifSnapshot = await getDocs(notifQuery);
                const notifList = [];
                notifSnapshot.forEach((doc) => {
                  notifList.push({ id: doc.id, ...doc.data() });
                });
                setNotifikasi(notifList);
              } catch (error) {
                console.log("Collection notifikasi tidak ditemukan");
              }
            } else {
              console.log("Dosen ini tidak membina UKM manapun");
            }
          }
        } else {
          await signOut(auth);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData || !ukmData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Anda tidak membina UKM apapun</h2>
          <p className="mt-2 text-gray-600">Silakan hubungi admin untuk ditugaskan ke UKM</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Pembina {ukmData.nama}</h1>
            <p className="text-indigo-200">Selamat datang, {userData.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-100 transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === "dashboard" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("anggota")}
              className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === "anggota" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Anggota
            </button>
            <button
              onClick={() => setActiveTab("agenda")}
              className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === "agenda" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Agenda
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* UKM Profile Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Profil UKM</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nama UKM</p>
                    <p className="mt-1 text-sm text-gray-900">{ukmData.nama}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pembina</p>
                    <p className="mt-1 text-sm text-gray-900">{ukmData.pembina}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Deskripsi</p>
                    <p className="mt-1 text-sm text-gray-900">{ukmData.deskripsi}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Jumlah Anggota</p>
                    <p className="mt-1 text-sm text-gray-900">{ukmData.jumlahAnggota}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ukmData.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {ukmData.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Total Anggota</p>
                    <p className="text-xl font-semibold text-gray-900">{anggotaUkm.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Agenda Mendatang</p>
                    <p className="text-xl font-semibold text-gray-900">{agendaUkm.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Notifikasi</p>
                    <p className="text-xl font-semibold text-gray-900">{notifikasi.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Notifikasi Terbaru</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {notifikasi.length} baru
                </span>
              </div>
              <div className="divide-y divide-gray-200">
                {notifikasi.length === 0 ? (
                  <div className="px-6 py-4 text-center text-gray-500">
                    Belum ada notifikasi
                  </div>
                ) : (
                  notifikasi.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="px-6 py-4">
                      <p className="text-sm text-gray-800">{notif.pesan}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {notif.tanggal ? new Date(notif.tanggal.seconds * 1000).toLocaleString() : "-"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Anggota Tab */}
        {activeTab === "anggota" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Anggota {ukmData.nama}</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari anggota..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fakultas
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jurusan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {anggotaUkm.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        Belum ada anggota terdaftar
                      </td>
                    </tr>
                  ) : (
                    anggotaUkm.map((angg) => (
                      <tr key={angg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                {angg.name ? angg.name.charAt(0).toUpperCase() : "A"}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{angg.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{angg.email || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{angg.fakultas || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{angg.jurusan || "-"}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Agenda Tab */}
        {activeTab === "agenda" && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Agenda {ukmData.nama}</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {agendaUkm.length === 0 ? (
                  <div className="px-6 py-4 text-center text-gray-500">
                    Belum ada agenda kegiatan
                  </div>
                ) : (
                  agendaUkm.map((item) => (
                    <div key={item.id} className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1">
                          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{item.judul}</h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {item.tanggal ? new Date(item.tanggal.seconds * 1000).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : "Tanggal belum tersedia"}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">{item.deskripsi}</p>
                          <p className="mt-1 text-xs text-indigo-600">Lokasi: {item.lokasi || "-"}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}