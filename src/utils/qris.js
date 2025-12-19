import { calculateCRC16 } from "./common.js";

const TAGS = {
  "00": "Payload Format Indicator",
  "01": "Point of Initiation Method",
  51: "Merchant Account Info (GLOBAL)",
  52: "Merchant Category Code (MCC)",
  53: "Transaction Currency",
  54: "Transaction Amount",
  58: "Country Code",
  59: "Merchant Name",
  60: "Merchant City",
  61: "Postal Code",
  62: "Additional Data",
  63: "CRC (Checksum)",
};

const KNOWN_GUIDS = {
  "ID.CO.GOPAY.WWW": "GoPay",
  "ID.CO.OVO.WWW": "OVO",
  "ID.DANA.WWW": "DANA",
  "ID.LINKAJA.WWW": "LinkAja",
  "ID.CO.SHOPEE.WWW": "ShopeePay",
  "ID.CO.BCA.WWW": "BCA",
  "ID.CO.BRI.WWW": "BRI",
  "ID.CO.BNI.WWW": "BNI",
  "ID.CO.BANKMANDIRI.WWW": "Livin (Mandiri)",
};

function parseTLV(raw) {
  let index = 0;
  const nodes = [];
  while (index < raw.length) {
    if (index + 4 > raw.length) break;
    const id = raw.substring(index, index + 2);
    const len = parseInt(raw.substring(index + 2, index + 4), 10);
    if (isNaN(len)) break;

    const val = raw.substring(index + 4, index + 4 + len);
    index += 4 + len;

    let name = TAGS[id] || `Tag ${id}`;
    let children = null;

    const idNum = parseInt(id);
    if ((idNum >= 26 && idNum <= 51) || id === "62") {
      try {
        if (val.includes("00") || val.includes("01")) {
          children = parseTLV(val);
        }
      } catch (e) {}

      if (children && children.length > 0) {
        const guid = children.find((n) => n.id === "00");
        if (guid && KNOWN_GUIDS[guid.val]) {
          name = `Account: ${KNOWN_GUIDS[guid.val]}`;
        } else if (idNum >= 26 && idNum <= 51) {
          name = `Merchant Info (${id})`;
        }
      }
    }
    nodes.push({ id, name, val, children });
  }
  return nodes;
}

export function analyzeQRIS(raw) {
  if (!raw.startsWith("000201")) {
    return { isQRIS: false, error: "Not a standard QRIS payload" };
  }

  const body = raw.slice(0, -4);
  const claimedCRC = raw.slice(-4).toUpperCase();
  const calculatedCRC = calculateCRC16(body);
  const isValid = claimedCRC === calculatedCRC;
  const structure = parseTLV(raw);

  let flags = [];
  if (!isValid) flags.push(`Integrity Error: CRC Claimed ${claimedCRC} != Calc ${calculatedCRC}`);

  return {
    isQRIS: true,
    isValid,
    claimedCRC,
    calculatedCRC,
    structure,
    flags
  };
}
