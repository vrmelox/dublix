import TauxPanne from "@/components/TauxPanne";
import StatsServices from "@/components/StatsServices";
import { equipmentsData as equipements } from "@/lib/data";
import BasEquipements from "@/components/BasEquipements";

type Service = {
  id: string;
  nom: string;
};

let services: Service[] = [];
equipements.forEach((equipement, i) => {
  equipement.services.forEach((serviceName, index) => {
    const servi = {
      id: i + index.toString(),
      nom: serviceName
    };
    services.push(servi);
  });
});
// Supposons que le "needleValue" est la quantité "En panne"
const Statistiques = () => (
  <div className="p-4 ">
    <div className="flex flex-col gap-4 lg:flex-row justify-center">
      <div className="w-full md:w-2/3 mx-auto flex flex-col h-[400px]">
        <StatsServices services={services} equipement={equipements}/>
      </div>
      <div className="w-full md:w-1/3 mx-full flex flex-col h-[400px]">
        <TauxPanne />
      </div>
    </div>
    <div className="w-full mx-auto">
      <BasEquipements equipements={equipements}/>
    </div>
  </div>
);

export default Statistiques

