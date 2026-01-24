import React, { useState, useEffect } from 'react';

function App() {
  // 1. Tempat Penampungan Data (STATE)
  //Awalan kosong, akan diisi data dari backend
  const [expenses, setExpenses] = useState([]);

  // 2. Fungsi untuk mengambil data dari backend
  const fetchExpenses =async () => {
    try {
      // Panggil API backend
      const response = await fetch('http://localhost:5000/expenses');
      const data = await response.json();

      // Simpan data ke state
      setExpenses(data.data);
      console.log("Data berhasil diambil:", data.data); //cek console browser
    } catch (error) {
      console.error("Gagal ambil data", error);
    }
  };

  // 3. Jalankan saat halaman dibuka (EFFECT)
  useEffect(() => {
    fetchExpenses();
  }, []);

  // 4. Tampilkan data di UI
  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'sans-serif'}}>
      <h1 style={{ textAlign: 'center'}}>💰 Expense Tracker</h1>
      {/*Tampilkan data dalam bentuk tabel sederhana*/}
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px' }}>Tanggal</th>
            <th style={{ padding: '10px' }}>Judul</th>
            <th style={{ padding: '10px' }}>Kategori</th>
            <th style={{ padding: '10px' }}>Harga</th>
          </tr>
        </thead>
        <tbody>
          {/* Looping data expenses */}
          {expenses.map((item) => (
            < tr key={item.id}>
              <td style={{ padding: '10px' }}>{item.title}</td>
              <td style={{ padding: '10px' }}>{item.category}</td>
              <td style={{ padding: '10px' }}>Rp {item.amount}</td>
              <td style={{ padding: '10px' }}>{item.date.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Jika data kosong, tampilkan pesan */}
      {expenses.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Belum ada data pengeluaran.</p>
      )}
    </div>
  );
}

export default App;