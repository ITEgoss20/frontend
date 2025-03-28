import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const deleteTable = async () => {
  try {
    const response = await fetch(
      "https://backend-jtl6.onrender.com/api/delete-stock-table",
      {
        method: "DELETE",
      }
    );
    if (response.ok) toast.success(`DB Table is deleted.`);
  } catch (err) {
    toast.error(`Server error`, err.data.message);
  }
};

export const clearCatche = (setNewInsertedRecords, setMissingExcelRecords) => {
  localStorage.removeItem("missingRecords");
  localStorage.removeItem("newRecords");
  localStorage.removeItem("whatsAppModelData");
  setNewInsertedRecords([]);
  setMissingExcelRecords([]);
  toast.success(`Cache cleared!`);
};

// https://web.whatsapp.com/send/?phone=918850513009&text=${formattedMessage}

export const formatDateToIST = (isoTimestamp) => {
  const date = new Date(isoTimestamp);

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", // Convert to IST
    day: "2-digit",
    month: "long", // Full month name (March)
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // Use 12-hour format with AM/PM
  });
};

export const formatWhatsAppMessage = (
  insertedRecords = [],
  missingRecords = []
) => {
  let message = `📊 Stock Update Report 📊\n\n`;
  message += `-----------------------------\n`;
  message += `✅ *Inserted:* ${insertedRecords.length}\n`;
  message += `❌ *Missing:* ${missingRecords.length}\n\n`;

  // Inserted Records
  if (insertedRecords.length === 0) {
    message += `*Newly Stock (In):* None\n\n`;
  } else {
    message += `*Newly Stock (In):*\n`;
    message += `Sr No.  |  Scan Code\n`;
    message += `----------------------\n`;
    insertedRecords.forEach((record, index) => {
      message += ` ${(index + 1).toString().padEnd(6)}    |   ${
        record.scan_code
      }\n`;
    });
    message += `\n`;
  }

  // Missing Records
  if (missingRecords.length === 0) {
    message += `*Stock Sold (Out):* None\n`;
  } else {
    message += `*Stock Sold (Out):*\n`;
    message += `Sr No.  |  Scan Code\n`;
    message += `----------------------\n`;
    missingRecords.forEach((record, index) => {
      message += ` ${(index + 1).toString().padEnd(6)}    |   ${
        record.scan_code
      }\n`;
    });
  }
  return encodeURIComponent(message);
};
export const downloadInsertedRecords = (insertedRecords) => {
  if (!insertedRecords || insertedRecords.length === 0) {
    alert("No inserted records to download!");
    return;
  }

  // Convert records into worksheet format
  const worksheet = XLSX.utils.json_to_sheet(insertedRecords);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inserted Records");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  const fileName = `Inserted_Records_${timestamp}.xlsx`;

  // Create and trigger download
  XLSX.writeFile(workbook, fileName);
};
