import Footer from "../Footer";
import { epilogue } from "../layout";
import BrandIcons from "./BrandIcons";
import Forms from "./Form";

export default function Home() {
  return (
<div className="min-h-screen flex items-center justify-center bg-[#E7F2F8]">
  <section className="relative w-full max-w-[850px] h-[500px] flex shadow-2xl rounded-2xl overflow-hidden">
    <div className="side-l bg-[#333652] w-[40%] flex flex-col items-center justify-center">
      <div className="logo-img flex flex-col mb-[4%] gap-8 items-center justify-center">
          <h2 className={`${epilogue.className} font-black text-[#16ADE1] text-[12px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[35px]`}>
            BioQR-Suivi
          </h2>
        <img
          src="/logo.png"
          alt=""
          className="img-signin lg:max-w-[250px]"
        />
      </div>
    </div>
    <div className="connexion w-[60%] m-auto py-[20px] px-[40px] transition-all duration-[600ms] ease-in-out">
      <h1 className="font-black text-center text-4xl text-[#16ADE1]">Connectez-vous</h1>
        <div className=" flex flex-col items-center">
          <BrandIcons />
          <span className="text-sm">Utilisez votre compte</span>
          <Forms />
        </div>
    </div>
  </section>
</div>

  );
}

