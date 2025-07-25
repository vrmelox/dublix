import Form from "./Form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">BioQR-Suivi</h1>
            <p className="text-gray-600">Connectez-vous à votre compte</p>
          </div>
          <Form />
        </div>
      </div>
    </div>
  );
}
