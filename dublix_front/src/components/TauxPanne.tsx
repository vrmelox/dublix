"use client";

import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const Data = [
  { name: "En panne", value: 20, color: "#ff4d4f" },
  { name: "Hors service", value: 10, color: "#faad14" },
  { name: "Fonctionnel", value: 70, color: "#52c41a" },
];

const RADIAN = Math.PI / 180;

// Ici cx et cy sont en % (centrage dynamique)
const CENTER_X = "50%";
const CENTER_Y = "60%"; // un peu plus bas pour équilibrer
const INNER_RADIUS = 40;
const OUTER_RADIUS = 80;

const Needle = ({
  value,
  data,
  cx,
  cy,
  iR,
  oR,
  color,
}: {
  value: number;
  data: typeof Data;
  cx: string | number;
  cy: string | number;
  iR: number;
  oR: number;
  color: string;
}) => {
  const total = data.reduce((acc, cur) => acc + cur.value, 0);
  const angle = 180 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * angle);
  const cos = Math.cos(-RADIAN * angle);
  const r = 5;

  const containerWidth = 300;
  const containerHeight = 200;
  const centerX =
    typeof cx === "string" && cx.endsWith("%")
      ? (parseFloat(cx) / 100) * containerWidth
      : (cx as number);
  const centerY =
    typeof cy === "string" && cy.endsWith("%")
      ? (parseFloat(cy) / 100) * containerHeight
      : (cy as number);

  const x0 = centerX + 5;
  const y0 = centerY + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return (
    <g>
      <circle cx={x0} cy={y0} r={r} fill={color} />
      <path d={`M${xba} ${yba} L${xbb} ${ybb} L${xp} ${yp} Z`} fill={color} />
    </g>
  );
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const EquipmentStatusChart = () => {
  const needleValue = Data.find((d) => d.name === "En panne")?.value || 0;
  const total = Data.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="w-full h-full  mx-auto p-4 bg-white rounded shadow flex flex-col items-center">
      <h2 className="text-center text-xl font-semibold mb-4">Répartition des équipements</h2>

      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={Data}
              dataKey="value"
              cx={CENTER_X}
              cy={CENTER_Y}
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              startAngle={180}
              endAngle={0}
              label={renderLabel}
              labelLine={false}
              stroke="none"
            >
              {Data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Needle
              value={needleValue}
              data={Data}
              cx={CENTER_X}
              cy={CENTER_Y}
              iR={INNER_RADIUS}
              oR={OUTER_RADIUS}
              color="#d0d000"
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: 12, marginTop: 10 }}
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <p className="text-center mt-4 text-gray-700 font-medium">
        Total équipements : <span className="font-bold text-blue-600">{total}</span>
      </p>
    </div>
  );
};

export default EquipmentStatusChart;
