import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarChart({ metrics }) {
  const data = {
    labels: ["Research", "Technical Skills", "Entrepreneurship", "Leadership", "Collaboration", "Creativity"],
    datasets: [
      {
        label: "Innovation Index",
        data: [
          metrics?.research || 74,
          metrics?.technical || 85,
          metrics?.entrepreneurship || 67,
          metrics?.leadership || 79,
          metrics?.collaboration || 91,
          metrics?.creativity || 82,
        ],
        backgroundColor: "rgba(108,99,255,0.2)",
        borderColor: "#6C63FF",
        pointBackgroundColor: "#00D4FF",
        pointBorderColor: "#fff",
        pointRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        angleLines: {
          color: "rgba(255,255,255,0.08)",
        },
        grid: {
          color: "rgba(255,255,255,0.08)",
        },
        pointLabels: {
          color: "#8B92B8",
          font: {
            size: 11,
            family: "Inter",
          },
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  return <Radar data={data} options={options} />;
}
