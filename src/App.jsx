import { ToastContainer } from "react-toastify";
import FileUploader from "./pages/FileUploader";




function App() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 lg:p-0">
      <ToastContainer autoClose={2000} />
      <FileUploader />
    </div>
  );
}

export default App;
