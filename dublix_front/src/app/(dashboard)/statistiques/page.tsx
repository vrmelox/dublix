import TauxPanne from "@/components/TauxPanne";

const data = [
  { name: "En panne", value: 20, color: "#ff4d4f" },
  { name: "Hors service", value: 10, color: "#faad14" },
  { name: "Fonctionnel", value: 70, color: "#52c41a" },
];

// Supposons que le "needleValue" est la quantité "En panne"
const Statistiques = () => (
  <div className="p-4">
    <div className="w-full md:w-1/3 mx-auto">
      <TauxPanne />
    </div>
  </div>
);

export default Statistiques

