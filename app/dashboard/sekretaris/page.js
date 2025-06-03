"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

export default function DashboardSekretaris() {
  const [userData, setUserData] = useState(null);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.role !== "sekretaris") {
            router.push("/unauthorized");
          } else {
            setUserData(data);
            fetchMahasiswa();
          }
        } else {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMahasiswa = async () => {
    const q = query(collection(db, "users"), where("role", "==", "peserta"));
    const querySnapshot = await getDocs(q);
    const mahasiswa = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMahasiswaList(mahasiswa);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard Sekretaris</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {userData && (
        <div className="mb-6">
          <p className="text-lg">Halo, {userData.name} 👋</p>
          <p className="text-gray-600">Role: Sekretaris</p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Data Mahasiswa untuk Verifikasi</h2>
        <table className="w-full table-auto border border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Nama</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Status Akun</th>
            </tr>
          </thead>
          <tbody>
            {mahasiswaList.map((mhs) => (
              <tr key={mhs.id} className="text-center">
                <td className="border px-4 py-2">{mhs.name}</td>
                <td className="border px-4 py-2">{mhs.email}</td>
                <td className="border px-4 py-2">{mhs.status_akun || "Belum Verifikasi"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
