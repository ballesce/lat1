"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, getDocs, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ukm, setUkm] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUkm, setIsLoadingUkm] = useState(false);
  const [ukmOptions, setUkmOptions] = useState([]);
  const [ukmDocs, setUkmDocs] = useState([]);
  const router = useRouter();

  const fakultasOptions = [
    "Fakultas Teknik",
    "Fakultas Ekonomi",
    "Fakultas Ilmu Komputer",
    "Fakultas Hukum",
  ];

  const jurusanOptions = {
    "Fakultas Teknik": ["Teknik Sipil", "Teknik Mesin", "Teknik Elektro"],
    "Fakultas Ekonomi": ["Manajemen", "Akuntansi", "Ekonomi Pembangunan"],
    "Fakultas Ilmu Komputer": ["Sistem Informasi", "Teknik Informatika", "Ilmu Komputer"],
    "Fakultas Hukum": ["Ilmu Hukum"],
  };

  // Fetch UKM data from Firestore
  useEffect(() => {
    const fetchUkmData = async () => {
      setIsLoadingUkm(true);
      try {
        const querySnapshot = await getDocs(collection(db, "ukms"));
        const ukms = [];
        const docs = [];
        querySnapshot.forEach((doc) => {
          ukms.push(doc.data().nama);
          docs.push({ id: doc.id, ...doc.data() });
        });
        setUkmOptions(ukms);
        setUkmDocs(docs);
      } catch (error) {
        console.error("Error fetching UKM data:", error);
        setError("Gagal memuat data UKM");
      } finally {
        setIsLoadingUkm(false);
      }
    };

    fetchUkmData();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (ukm === "") {
      setError("Mohon pilih UKM.");
      setIsLoading(false);
      return;
    }
    if (fakultas === "") {
      setError("Mohon pilih Fakultas.");
      setIsLoading(false);
      return;
    }
    if (jurusan === "") {
      setError("Mohon pilih Jurusan.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document with fixed 'mahasiswa' role
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: "mahasiswa", // Hardcoded as mahasiswa
        ukm: ukm,
        fakultas: fakultas,
        jurusan: jurusan,
        createdAt: new Date().toISOString()
      });

      // Update the UKM's member count
      const selectedUkm = ukmDocs.find(u => u.nama === ukm);
      if (selectedUkm) {
        const ukmRef = doc(db, "ukms", selectedUkm.id);
        await updateDoc(ukmRef, {
          jumlahAnggota: increment(1)
        });
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.message.includes("email-already-in-use")
          ? "Email sudah terdaftar"
          : "Registrasi gagal. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Daftar Anggota UKM</h1>
          <p className="text-gray-600">Pendaftaran khusus untuk mahasiswa Universitas Ma'soem</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm text-center">
              Registrasi berhasil! Mengarahkan ke halaman login...
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contoh@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minimal 6 karakter"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Fakultas</label>
              <select
                value={fakultas}
                onChange={(e) => {
                  setFakultas(e.target.value);
                  setJurusan("");
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Fakultas</option>
                {fakultasOptions.map((fak, idx) => (
                  <option key={idx} value={fak}>
                    {fak}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Jurusan</label>
              <select
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!fakultas}
              >
                <option value="">Pilih Jurusan</option>
                {fakultas && jurusanOptions[fakultas]?.map((jur, idx) => (
                  <option key={idx} value={jur}>
                    {jur}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih UKM</label>
              <select
                value={ukm}
                onChange={(e) => setUkm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoadingUkm}
              >
                <option value="">Pilih UKM</option>
                {isLoadingUkm ? (
                  <option value="" disabled>Memuat data UKM...</option>
                ) : (
                  ukmOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))
                )}
              </select>
              {isLoadingUkm && (
                <p className="mt-1 text-xs text-gray-500">Sedang memuat daftar UKM...</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } transition-colors`}
            >
              {isLoading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}