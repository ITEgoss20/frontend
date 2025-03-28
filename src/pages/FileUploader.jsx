import { useEffect, useState } from "react";
import WhatsAppModal from "../component/WhatsAppModal.jsx";
import {
  deleteTable,
  clearCatche,
  formatDateToIST,
  formatWhatsAppMessage,
  downloadInsertedRecords,
} from "../services.js";

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [newInsertedRecords, setNewInsertedRecords] = useState([]);
  const [missingExcelRecords, setMissingExcelRecords] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false); // Set true to see it on load
  const [whatsAppData, setWhatsAppData] = useState({});
  const [lastInserted, setLasInserted] = useState({});
  const [abortController, setAbortController] = useState(null); // Store AbortController

  const getRecordsFromLocal = () => {
    const newRecords = JSON.parse(localStorage.getItem("newRecords")) || [];
    const missingExcelRecords =
      JSON.parse(localStorage.getItem("missingRecords")) || [];
    return { newRecords, missingExcelRecords };
  };

  useEffect(() => {
    const storedRecords = getRecordsFromLocal().newRecords;
    setNewInsertedRecords(storedRecords);
    const missingExcelRecords = getRecordsFromLocal().missingExcelRecords;
    setMissingExcelRecords(missingExcelRecords);
  }, []);

  const fetchLatest = async () => {
    try {
      const response = await fetch(
        "https://backend-jtl6.onrender.com/api/get-last-record",
        {
          method: "GET",
        }
      );
      setLasInserted(await response.json());
    } catch (error) {
      console.log("Error fetching record:", error);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
    }
  };
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setMessage("");

    // Create a new AbortController instance for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch(
        "https://backend-jtl6.onrender.com/api/upload-and-compare",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );
      const result = await response.json();
      if (response.ok) {
        setMessage(`File uploaded successfully!`);
        const whatsappMessage = {
          recordsInserted: result.recordsInserted,
          insertedRecords: result.insertedRecords,
          missingRecordsCount: result.missingRecordsCount,
          missingRecords: result.missingRecords,
          message: formatWhatsAppMessage(
            result.insertedRecords,
            result.missingRecords
          ),
          // message: `📊 *Stock Update Report* 📊\n\n✅ Inserted: ${result.recordsInserted}\n❌ Missing: ${result.missingRecordsCount}\n\nThank you!`,
          whatsappLink: result.whatsappLink,
        };
        setWhatsAppData(whatsappMessage);
        setModalOpen(true);
        setNewInsertedRecords(result.insertedRecords);
        setMissingExcelRecords(result.missingRecords);
        localStorage.setItem(
          "whatsAppModelData",
          JSON.stringify(whatsappMessage)
        );
        localStorage.setItem(
          "newRecords",
          JSON.stringify(result.insertedRecords)
        );
        localStorage.setItem(
          "missingRecords",
          JSON.stringify(result.missingRecords)
        );
        handleRemoveFile();
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        // console.log("File upload was canceled.");
      } else {
        setMessage(error.message)
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    if (abortController) {
      abortController.abort(); // Cancel the fetch request
      setAbortController(null); // Reset the controller
    }
    setFile(null);
    setLoading(false);
    document.getElementById("file").value = ""; // Reset file input
  };
  return (
    <>
      <h1 className="text-3xl font-bold mt-6">File Uploader</h1>
      <p className="text-lg mb-2">Upload your file here</p>
      <div className="bg-white relative p-6 rounded-lg shadow-lg text-black h-56 w-80 flex flex-col items-center">
        {lastInserted.created_at && (
          <p>{formatDateToIST(lastInserted.created_at)}</p>
        )}
        <div className="mt-4 w-full">
          <input
            id="file"
            type="file"
            className="mb-4 border cursor-pointer p-2 rounded w-full hidden"
            onChange={handleFileChange}
          />
          {!file && (
            <label
              className="mb-4 border cursor-pointer p-2 rounded w-full block text-center"
              htmlFor="file"
            >
              Choose File
            </label>
          )}
          {file && (
            <p className="text-sm text-gray-700 mb-2 text-center">
              Selected: {file.name}
            </p>
          )}
        </div>
        {file && (
          <button
            className="absolute top-0 right-3 text-3xl rotate-45"
            onClick={handleRemoveFile}
          >
            +
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        {message && (
          <p
            className={`mt-0.5 text-center text-sm ${
              message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
        <div className="absolute space-x-2 flex items-center text-xs bottom-1 right-1">
          <button
            onClick={deleteTable}
            className="cursor-pointer p-1 bg-red-600 text-white rounded-sm"
          >
            Delete Table
          </button>
          {(missingExcelRecords.length > 0 ||
            newInsertedRecords.length > 0) && (
            <>
              <button
                onClick={() =>
                  clearCatche(setNewInsertedRecords, setMissingExcelRecords)
                }
                className="cursor-pointer p-1 bg-red-600 text-white rounded-sm"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const whatsappMessage =
                    JSON.parse(localStorage.getItem("whatsAppModelData")) || [];
                  if (!whatsAppData) return;
                  setWhatsAppData(whatsappMessage);
                  setModalOpen(true);
                }}
                className="cursor-pointer p-1 bg-green-600 text-white rounded-sm"
              >
                Send to WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
      <WhatsAppModal
        isModalOpen={isModalOpen}
        whatsAppData={whatsAppData}
        setModalOpen={setModalOpen}
      />
      {/* Table for sr and scan_code */}
      <div className="sm:flex justify-center w-full sm:space-x-12">
        <div className="sm:w-[50%] lg:w-[30%]">
          <div className="mt-6 relative">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold mb-3 ">
                {newInsertedRecords.length} Newly Stock (In)
              </h2>
              {getRecordsFromLocal().newRecords.length > 0 && (
                <button
                  onClick={() => downloadInsertedRecords(newInsertedRecords)}
                  className="text-xs cursor-pointer p-2 bg-blue-800 rounded-lg"
                >
                  Download
                </button>
              )}
            </div>

            <div className="h-44 overflow-y-auto border bg-gray-100 shadow-md w-full">
              <table className="min-w-full border text-black relative text-xs h-40">
                <thead className="sticky top-0">
                  <tr className="bg-black text-white">
                    <th className="py-2 px-4">Sr</th>
                    <th className="py-2 px-4">Scan Code</th>
                    {/* <th className="py-2 px-4">Date & Time (In)</th> */}
                  </tr>
                </thead>
                <tbody>
                  {newInsertedRecords.length > 0 &&
                    newInsertedRecords.map((record, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2 px-4 border text-black">
                          {record.sr}
                        </td>
                        <td className="py-2 px-4 border text-black">
                          {record.scan_code}
                        </td>
                        {/* <td className="py-2 px-4 border text-black">
                          {formatDateToIST(record.created_at)}
                        </td> */}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className=" sm:w-[50%] lg:w-[30%]">
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-3 text-center">
              {missingExcelRecords.length} Stock Sold (Out)
            </h2>
            <div className="h-44 overflow-y-auto border bg-gray-100 shadow-md w-full">
              <table className="min-w-full text-black relative  text-xs">
                <thead className="sticky top-0">
                  <tr className="bg-black text-white">
                    <th className="py-2 px-4">Sr</th>
                    <th className="py-2 px-4">Scan Code</th>
                    {/* <th className="py-2 px-4">Date & Time (Out)</th> */}
                  </tr>
                </thead>
                <tbody>
                  {missingExcelRecords.length > 0 &&
                    missingExcelRecords.map((record, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2 px-4 border text-black">
                          {record.sr}
                        </td>
                        <td className="py-2 px-4 border text-black">
                          {record.scan_code}
                        </td>
                        {/* <td className="py-2 px-4 border text-black">
                          {formatDateToIST(record.created_at)}
                        </td> */}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FileUploader;
