"use client";
import Link from 'next/link';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { FiLogOut, FiCalendar, FiUsers, FiAward, FiClock, FiArrowRight } from "react-icons/fi";

export default function DashboardMahasiswa() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.role !== "mahasiswa") {
            router.push("/login");
            return;
          }

          setUserData({
            name: data.name,
            email: user.email,
            role: data.role,
            statusKeanggotaan: data.statusKeanggotaan || "Aktif",
            kegiatanDiikuti: data.kegiatanDiikuti || 0,
            ukm: data.ukm || "Belum memilih UKM",
          });

          // Ambil kegiatan terbaru
          const q = query(
            collection(db, "activities"),
            where("participants", "array-contains", user.uid)
          );
          const querySnapshot = await getDocs(q);
          let recentActivities = [];
          querySnapshot.forEach((doc) => {
            recentActivities.push({ id: doc.id, ...doc.data() });
          });
          recentActivities = recentActivities
            .sort((a, b) => b.date.seconds - a.date.seconds)
            .slice(0, 5);
          setActivities(recentActivities);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Selamat Datang, <span className="text-blue-600">{userData.name}</span>
            </h1>
            <p className="text-gray-600 mt-1">Dashboard Mahasiswa UKM</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg shadow hover:bg-red-50 transition-all border border-red-100"
          >
            <FiLogOut /> Keluar
          </button>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <FiCalendar size={20} />
              </div>
              <h3 className="text-lg font-medium text-gray-700">Kegiatan Diikuti</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{userData.kegiatanDiikuti}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <FiUsers size={20} />
              </div>
              <h3 className="text-lg font-medium text-gray-700">Status Keanggotaan</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 capitalize">{userData.statusKeanggotaan.toLowerCase()}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                <FiAward size={20} />
              </div>
              <h3 className="text-lg font-medium text-gray-700">UKM</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{userData.ukm}</p>
          </div>
        </section>

        {/* Recent Activities */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiCalendar className="text-blue-500" /> Kegiatan Terbaru
            </h2>
            <Link href="/kegiatan" className="text-sm text-blue-600 hover:text-blue-800">
              Lihat Semua
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Belum ada kegiatan yang diikuti</p>
              <Link
                href="/kegiatan"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Cari Kegiatan <FiArrowRight />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{act.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-gray-600">
                        <span className="flex items-center gap-1">
                          <FiClock size={16} />
                          {new Date(act.date.seconds * 1000).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="hidden sm:inline-block">•</span>
                        <span className="flex items-center gap-1">
                          <FiMapPin size={16} />
                          {act.location}
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 self-start md:self-center">
                      Detail <FiArrowRight />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Additional Info Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Pengumuman</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <p className="font-medium">Pendaftaran UKM Semester Ganjil 2023</p>
                <p className="text-sm text-gray-600">Batas pendaftaran: 30 September 2023</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-1">
                <p className="font-medium">Pelatihan Kepemimpinan UKM</p>
                <p className="text-sm text-gray-600">15-17 Oktober 2023</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Prestasi UKM</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-100 p-2 rounded-full mt-1">
                  <FiAward className="text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Juara 1 Lomba Robotika Nasional</p>
                  <p className="text-sm text-gray-600">UKM Robotika - Mei 2023</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full mt-1">
                  <FiAward className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Penghargaan Karya Seni Terbaik</p>
                  <p className="text-sm text-gray-600">UKM Seni Rupa - April 2023</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}