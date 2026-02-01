import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = ({ expenses }) => {
  // 1. LOGIKA PENGELOMPOKAN DATA
  const categoryTotals = expenses.reduce((acc, curr) => {
    const category = curr.category;
    const amount = Number(curr.amount);

    if (acc[category]) {
      acc[category] += amount;
    } else {
      acc[category] = amount;
    }
    return acc;
  }, {});

  // --- [BARU] KAMUS WARNA TETAP (KTP Warna) ---
  // Pastikan nama Key-nya SAMA PERSIS dengan value di <option> select
  const CATEGORY_COLORS = {
    Makan: "#4361ee", // Biru
    Minuman: "#4cc9f0", // Biru Muda
    Transport: "#f72585", // Pink
    Belanja: "#fca311", // Oranye
    Lainnya: "#2b2d42", // Gelap
  };

  // Warna cadangan kalau ada kategori aneh yang gak terdaftar
  const DEFAULT_COLOR = "#ef233c"; // Merah

  // Ambil daftar nama kategori yang sedang tampil
  const chartLabels = Object.keys(categoryTotals);

  // Ambil data angka
  const chartValues = Object.values(categoryTotals);

  // --- [BARU] LOGIKA PEWARNAAN ---
  // "Untuk setiap Label yang muncul, cari warnanya di Kamus. Kalau gak ada, kasih warna default."
  const chartColors = chartLabels.map(
    (category) => CATEGORY_COLORS[category] || DEFAULT_COLOR,
  );

  // 2. MENYIAPKAN DATA UNTUK CHART.JS
  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: "Total Pengeluaran (Rp)",
        data: chartValues,
        backgroundColor: chartColors, // <--- Pakai warna hasil pencarian tadi
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div
      style={{
        height: "300px",
        marginBottom: "30px",
        padding: "20px",
        background: "white",
        borderRadius: "15px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          margin: "0 0 20px 0",
          fontSize: "1.2rem",
          color: "#555",
        }}
      >
        Statistik Pengeluaran
      </h3>
      <div style={{ height: "220px", position: "relative" }}>
        {expenses.length > 0 ? (
          <Doughnut data={data} options={options} />
        ) : (
          <p style={{ textAlign: "center", paddingTop: "80px", color: "#ccc" }}>
            Data Kosong
          </p>
        )}
      </div>
    </div>
  );
};

export default ExpenseChart;
