import Announcements from "@/components/Notifications"
import UserCard from "@/components/UserCard"
import CalendarBig from "@/components/CalendarBig"

const TechnicienPage = () => {
    return (
        <div className="flex-1 wrap-normal p-4 flex gap-4 flex-col xl:flex-row">
            {/* LEFT */}

            <div className="w-full xl:w-2/3">
                <div className="h-full">
                        <div className="flex gap-4 justify-between flex-wrap w-full ">
                        <UserCard type="Equipements" number={2145}/> 
                        <UserCard type="Défectueux" number={607}/> 
                        <UserCard type="Mes interventions" number={128}/> 
                        </div>
                    <div className="h-full bg-white p-4 rounded-md mt-4">
                        <h1 className="text-xl font-semibold mb-2">Emploi du temps</h1>
                        <CalendarBig/>
                    </div>
                </div>
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-8">
                <Announcements />
            </div>
        </div>
    )
}

export default TechnicienPage