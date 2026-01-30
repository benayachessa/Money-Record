import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = ({ expenses }) => {
  // 1. LOGIKA PENGELOMPOKAN DATA
  //Mengubah data menjadi:  { category: totalAmount }
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

  // 2. MENYIAPKAN DATA UNTUK CHART.JS
  const data = {
    labels: Object.keys(categoryTotals), //contoh: ['makan', 'transportasi']
    datasets: [
      {
        label: "Total Pengeluaran (Rp)",
        data: Object.values(categoryTotals), //contoh: [50000, 20000]
        backgroundColor: [
          "#4361ee",
          "#f72585",
          "#4cc9f0",
          "#fca311",
          "#2b2d42",
          "#ef233c",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom", //Posisi Label di bawah
      },
    },
    maintainAspectRatio: false, //Agar chart bisa menyesuaikan ukuran container
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
      {/* Menampilkan Grafik Donat */}
      <div style={{ height: "220px", position: "relative" }}>
        {expenses.length > 0 ? (
          <Doughnut data={data} options={options} />
        ) : (
          <p style={{ textAlign: "center", paddingTop: "80px", color: "#ccc" }}>
            Belum ada data
          </p>
        )}
      </div>
    </div>
  );
};

export default ExpenseChart;
