import TauxPanne from "@/components/TauxPanne";
import StatsServices from "@/components/StatsServices";

const data = [
  { name: "En panne", value: 20, color: "#ff4d4f" },
  { name: "Hors service", value: 10, color: "#faad14" },
  { name: "Fonctionnel", value: 70, color: "#52c41a" },
];

const equipements = [
  {
    equipId: "EQ-001",
    nom: "Moniteur Cardiaque",
    modèle: "CardioX 2000",
    statut: "FONCTIONNEL",
    services: ["Cardiologie", "Urgences"],
    photo: "https://exemple.com/moniteur.jpg",
  },
  {
    equipId: "EQ-002",
    nom: "Scanner Médical",
    modèle: "ScanPro 300",
    statut: "PANNE",
    services: ["Radiologie"],
    photo: "https://exemple.com/scanner.jpg",
  },
  {
    equipId: "EQ-002",
    nom: "Scanner Médical",
    modèle: "ScanPro 300",
    statut: "PANNE",
    services: ["Radiologie"],
    photo: "https://exemple.com/scanner.jpg",
  },
  {
    equipId: "EQ-002",
    nom: "Scanner Médical",
    modèle: "ScanPro 300",
    statut: "FONCTIONNEL",
    services: ["Radiologie"],
    photo: "https://exemple.com/scanner.jpg",
  },
];
const service = [
      { id: "abc123", nom: "Radiologie" }, 
      { id: "ab23", nom: "Ophtalmologie" },
      { id: "a4b23", nom: "Réanimation" },
      { id: "Ska784", nom: "Maternité" },
    ];
// Supposons que le "needleValue" est la quantité "En panne"
const Statistiques = () => (
  <div className="p-4 flex flex-col md:flex-row items-stretch justify-center">
    <div className="w-full md:w-2/3 mx-auto flex flex-col">
      <StatsServices services={service} equipement={equipements}/>
    </div>
    <div className="w-full md:w-1/3 mx-auto flex flex-col">
      <TauxPanne />
    </div>
  </div>
);

export default Statistiques

