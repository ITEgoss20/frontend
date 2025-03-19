import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const WhatsAppModal = ({ isModalOpen, setModalOpen, whatsAppData }) => {
  if (!isModalOpen) return null;

  // Device detection for WhatsApp App vs Web
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleWhatsAppRedirect = () => {
    // Priority to backend-provided WhatsApp link
    if (whatsAppData?.whatsappLink) {
      window.open(whatsAppData.whatsappLink, "_blank");
      return;
    }

    // Fallback link generation
    const phone = "919359748376"; // Change to dynamic phone if needed
    const message = encodeURIComponent(
      whatsAppData?.message || "No message received from backend."
    );

    const link = isMobile
      ? `whatsapp://send?phone=${phone}&text=${message}`
      : `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;

    window.open(link, "_blank");
  };

  return (
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      className="fixed top-0 left-0 w-full z-50 flex justify-center"
    >
      <div className="bg-white shadow-lg rounded-b-2xl p-6 max-w-lg w-full mx-4 mt-4 text-black">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">📨 WhatsApp Message Preview</h2>
          <button onClick={() => setModalOpen(false)}>
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* ✅ Inserted Records Count */}
        {whatsAppData?.recordsInserted !== undefined && (
          <p className="mb-2 font-medium text-green-700">
            ✅ Inserted Records: {whatsAppData.recordsInserted}
          </p>
        )}

        {/* ✅ Inserted Records List */}
        {whatsAppData?.insertedRecords?.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold mb-1">Inserted Records (Scan Codes):</p>
            <div className="bg-green-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
              {whatsAppData.insertedRecords.map((rec, index) => (
                <p key={index}>➡️ {rec.scan_code}</p>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Missing Records Count */}
        {whatsAppData?.missingRecordsCount !== undefined && (
          <p className="mb-2 font-medium text-red-700">
            ❌ Missing Records: {whatsAppData.missingRecordsCount}
          </p>
        )}

        {/* ✅ Missing Records List */}
        {whatsAppData?.missingRecords?.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold mb-1">Missing Records (Scan Codes):</p>
            <div className="bg-red-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
              {whatsAppData.missingRecords.map((rec, index) => (
                <p key={index}>⚠️ {rec.scan_code}</p>
              ))}
            </div>
          </div>
        )}

        {/* ✅ WhatsApp Message Content */}
        <div className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
          {whatsAppData?.message}
        </div>

        {/* ✅ WhatsApp Button */}
        <button
          onClick={handleWhatsAppRedirect}
          className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
        >
          Open in WhatsApp
        </button>
      </div>
    </motion.div>
  );
};

export default WhatsAppModal;
