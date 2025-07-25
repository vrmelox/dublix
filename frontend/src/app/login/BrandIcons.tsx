import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGoogle, faSlack } from '@fortawesome/free-brands-svg-icons';

export default function BrandIcons() {
  return (
  <div className="my-3 mx-[20px] w-full flex gap-4 justify-center items-center ">
    <FontAwesomeIcon icon={faFacebook} className="w-10 h-10 p-2 border border-[#ddd] rounded-full text-[#4267B2]" />
    <FontAwesomeIcon icon={faGoogle} className="w-10 h-10 p-2 border border-[#ddd] rounded-full text-[#DB4437]" />
    <FontAwesomeIcon icon={faSlack} className="w-10 h-10 p-2 border border-[#ddd] rounded-full text-[#4A154B]" />
  </div>
  );
}