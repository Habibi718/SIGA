import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function TrendChart() {
  const data = {
    labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
    datasets: [
      {
        label: "Innovation Index",
        data: [54, 61, 68, 74, 79, 83],
        borderColor: "#6C63FF",
        backgroundColor: "rgba(108,99,255,0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#6C63FF",
        pointRadius: 5,
        borderWidth: 2,
      },
      {
        label: "Research Index",
        data: [32, 40, 48, 57, 66, 72],
        borderColor: "#00D4FF",
        backgroundColor: "rgba(0,212,255,0.08)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#00D4FF",
        pointRadius: 5,
        borderWidth: 2,
      },
      {
        label: "Startups",
        data: [1, 1, 2, 3, 5, 6],
        borderColor: "#6BCB77",
        backgroundColor: "rgba(107,203,119,0.08)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#6BCB77",
        pointRadius: 5,
        borderWidth: 2,
        yAxisID: "y2",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: "#8B92B8",
          font: {
            size: 12,
            family: "Inter",
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
        ticks: {
          color: "#8B92B8",
        },
      },
      y: {
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
        ticks: {
          color: "#8B92B8",
        },
        min: 0,
        max: 100,
      },
      y2: {
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "#6BCB77",
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
