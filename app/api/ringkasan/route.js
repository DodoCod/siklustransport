const SHEET_ID = "1cv6Sc_oANVfFKr_EHC4Tib04aenMYYbdgz9-VNEZ-Yw";
const SHEET_GID = "2000796785";

function valueOf(cell) {
  if (!cell || cell.v === null || cell.v === undefined) return "";
  return String(cell.f ?? cell.v).replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

function rowCells(row) {
  return row?.c ?? [];
}

function parseGoogleResponse(text) {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf(")");
  if (jsonStart < 0 || jsonEnd < jsonStart) throw new Error("Format data Google Sheets tidak dikenali.");
  return JSON.parse(text.slice(jsonStart, jsonEnd));
}

function toRecord(cells, columns, fallbackTime = "") {
  const rawTime = valueOf(cells[columns.time]);
  const normalizedTime = rawTime.toLowerCase();
  return {
    no: valueOf(cells[columns.no]),
    name: valueOf(cells[columns.name]),
    location: valueOf(cells[columns.location]),
    time: rawTime && normalizedTime !== "true" && normalizedTime !== "false" ? rawTime : fallbackTime,
    phone: valueOf(cells[columns.phone]),
    group: valueOf(cells[columns.group])
  };
}

export async function GET() {
  const url = "https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/gviz/tq?tqx=out:json&gid=" + SHEET_GID;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "ringkasan-transportasi/1.0" }
    });

    if (!response.ok) throw new Error("Google Sheets mengembalikan status " + response.status + ".");

    const payload = parseGoogleResponse(await response.text());
    const rows = payload?.table?.rows ?? [];
    const day2PickupHeaderIndex = rows.findIndex((row) => valueOf(rowCells(row)[1]) === "Nama Maba" && valueOf(rowCells(row)[3]).includes("Jam Jemput Day 2"));
    const routeRows = day2PickupHeaderIndex >= 0 ? rows.slice(0, day2PickupHeaderIndex) : rows;

    const day1Pickup = routeRows
      .map(rowCells)
      .filter((cells) => valueOf(cells[0]) && valueOf(cells[1]) && valueOf(cells[3]).includes(":"))
      .map((cells) => toRecord(cells, { no: 0, name: 1, location: 2, time: 3, phone: 4, group: 5 }));

    const day2Dropoff = routeRows
      .map(rowCells)
      .filter((cells) => valueOf(cells[7]) && valueOf(cells[8]))
      .map((cells) => toRecord(cells, { no: 7, name: 8, location: 9, time: 10, phone: 11, group: 12 }));

    const day2PickupHeader = day2PickupHeaderIndex >= 0 ? valueOf(rowCells(rows[day2PickupHeaderIndex])[3]) : "";
    const pickupTimeMatch = day2PickupHeader.match(/\(([^)]+)\)/);
    const pickupTime = pickupTimeMatch ? pickupTimeMatch[1] : "07:00";
    const day2Pickup = (day2PickupHeaderIndex >= 0 ? rows.slice(day2PickupHeaderIndex + 1) : [])
      .map(rowCells)
      .filter((cells) => valueOf(cells[0]) && valueOf(cells[1]))
      .map((cells) => toRecord(cells, { no: 0, name: 1, location: 2, time: 3, phone: 4, group: 5 }, pickupTime));

    return Response.json({
      data: { day1Pickup, day2Dropoff, day2Pickup },
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Gagal mengambil data Ringkasan." },
      { status: 502 }
    );
  }
}
