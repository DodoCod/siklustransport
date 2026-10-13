"use client";

import { useEffect, useMemo, useState } from "react";
import { summaryData } from "../lib/summary-data";

const ROUTES = [
  {
    id: "day1-pickup",
    dataKey: "day1Pickup",
    eyebrow: "HARI 1 · SORE",
    title: "Jemput Day 1",
    shortTitle: "Jemput D1",
    description: "Penjemputan peserta menuju lokasi kegiatan.",
    color: "mint",
    timeLabel: "15:00",
    locationLabel: "LOKASI JEMPUT"
  },
  {
    id: "day2-dropoff",
    dataKey: "day2Dropoff",
    eyebrow: "HARI 2 · PAGI",
    title: "Antar Day 2",
    shortTitle: "Antar D2",
    description: "Antar peserta kembali ke titik tujuan.",
    color: "blue",
    timeLabel: "06:00–07:00",
    locationLabel: "LOKASI ANTAR"
  },
  {
    id: "day2-pickup",
    dataKey: "day2Pickup",
    eyebrow: "HARI 2 · PAGI",
    title: "Jemput Day 2",
    shortTitle: "Jemput D2",
    description: "Penjemputan lanjutan pada pagi hari.",
    color: "coral",
    timeLabel: "07:00",
    locationLabel: "LOKASI JEMPUT"
  }
];

function phoneHref(phone) {
  if (!phone) return "#";
  if (phone.startsWith("http")) return phone;
  return "https://wa.me/" + phone.replace(/\D/g, "");
}


function RouteIcon({ color }) {
  return (
    <span className={"route-icon route-icon--" + color} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 19.5h14M7.5 19.5V6.8a1.8 1.8 0 0 1 1.8-1.8h5.4a1.8 1.8 0 0 1 1.8 1.8v12.7M5 9.5h14M9.5 4.5V2.8M14.5 4.5V2.8M9 13h.01M15 13h.01M9 16h.01M15 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}


function WhatsAppIcon() {
  return (
    <svg className='whatsapp-icon' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M20.4 11.7a8.4 8.4 0 0 1-12.6 7.1L4 20l1.2-3.6a8.4 8.4 0 1 1 15.2-4.7Z' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M8.8 8.6c.2-.2.5-.2.7-.1l1.1.6c.2.1.3.4.2.6l-.4.8c.6 1.1 1.5 2 2.6 2.6l.8-.4c.2-.1.5 0 .6.2l.6 1.1c.1.2.1.5-.1.7-.4.4-1 .5-1.5.4-2.4-.7-4.3-2.6-5-5-.2-.5 0-1.1.4-1.5Z' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}
export default function Home() {
  const [activeRouteId, setActiveRouteId] = useState("day1-pickup");
  const [data, setData] = useState(summaryData);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const activeRoute = ROUTES.find((route) => route.id === activeRouteId) || ROUTES[0];
  const currentRows = data[activeRoute.dataKey] || [];

  async function refreshData() {
    try {
      const response = await fetch("/api/ringkasan", { cache: "no-store" });
      if (!response.ok) throw new Error("sync failed");
      const result = await response.json();
      if (result.data) setData(result.data);
    } catch {
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const groups = useMemo(
    () => [...new Set(currentRows.map((row) => row.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, "id")),
    [currentRows]
  );
  const locations = useMemo(
    () => [...new Set(currentRows.map((row) => row.location).filter(Boolean))].sort((a, b) => a.localeCompare(b, "id")),
    [currentRows]
  );
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return currentRows.filter((row) => {
      const matchesQuery = !normalizedQuery || [row.name, row.group, row.location, row.phone].join(" ").toLowerCase().includes(normalizedQuery);
      const matchesGroup = groupFilter === "all" || row.group === groupFilter;
      const matchesLocation = locationFilter === "all" || row.location === locationFilter;
      return matchesQuery && matchesGroup && matchesLocation;
    });
  }, [currentRows, groupFilter, locationFilter, query]);

  function chooseRoute(routeId) {
    setActiveRouteId(routeId);
    setQuery("");
    setGroupFilter("all");
    setLocationFilter("all");
  }

  return (
    <main className="app-shell">
      <section className="app-view">


        <div className="content-wrap">


          <section className={"active-route active-route--" + activeRoute.color}>
            <div className="active-route-heading">
              <RouteIcon color={activeRoute.color} />
              <div>
                <p className="eyebrow">{activeRoute.eyebrow}</p>
                <h2>{activeRoute.title}</h2>
                <p>{activeRoute.description}</p>
              </div>
            </div>
            <div className="active-route-time">
              <span>JAM</span>
              <strong>{activeRoute.timeLabel}</strong>
            </div>
          </section>

          <section className="filter-panel">
            <label className="field-stack field-stack--search">
              <span>Cari peserta</span>
              <div className="search-field">
                <SearchIcon />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama atau kelompok" aria-label="Cari peserta" />
              </div>
            </label>
            <div className="filter-grid">
              <label className="field-stack">
                <span>Kelompok</span>
                <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} aria-label="Filter kelompok">
                  <option value="all">Semua kelompok</option>
                  {groups.map((group) => <option key={group} value={group}>{group}</option>)}
                </select>
              </label>
              <label className="field-stack">
                <span>Lokasi</span>
                <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} aria-label="Filter lokasi">
                  <option value="all">Semua lokasi</option>
                  {locations.map((location) => <option key={location} value={location}>{location}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section className="participants-section">
            <div className="section-title">
              <div>
                <p className="eyebrow">DAFTAR PESERTA</p>
                <h2>{activeRoute.title}</h2>
              </div>
              <span>{filteredRows.length} peserta</span>
            </div>

            {filteredRows.length === 0 ? (
              <div className="empty-state">
                <span>⌕</span>
                <strong>Data tidak ditemukan</strong>
                <p>Coba ubah kata kunci atau filter yang dipilih.</p>
              </div>
            ) : (
              <div className="participant-grid">
                {filteredRows.map((row) => (
                  <article className={"participant-card" + (!row.location ? " participant-card--attention" : "")} key={activeRoute.id + "-" + row.no + "-" + row.name}>
                    <div className="participant-main">
                      <span className="participant-number">{String(row.no).padStart(2, "0")}</span>
                      <div className="person-copy">
                        <strong>{row.name}</strong>
                        <span>{row.group}</span>
                      </div>
                      <a className="whatsapp-button" href={phoneHref(row.phone)} target="_blank" rel="noreferrer" aria-label={"Hubungi " + row.name + " via WhatsApp"}><WhatsAppIcon /></a>
                    </div>
                    <div className="participant-details">
                      <div className="detail-item">
                        <span>{activeRoute.locationLabel}</span>
                        <strong className={!row.location ? "detail-missing" : ""}>{row.location || "Belum ditentukan"}</strong>
                      </div>
                      <div className="detail-item detail-item--time">
                        <span>JAM</span>
                        <strong>{row.time || activeRoute.timeLabel}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <nav className="bottom-nav" aria-label="Jalur transportasi">
          <div className="bottom-nav-inner">
            {ROUTES.map((route) => {
              const isActive = route.id === activeRouteId;
              const count = data[route.dataKey] ? data[route.dataKey].length : 0;
              return (
                <button
                  key={route.id}
                  type="button"
                  className={"bottom-nav-item bottom-nav-item--" + route.color + (isActive ? " bottom-nav-item--active" : "")}
                  onClick={() => chooseRoute(route.id)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={route.title + ", " + count + " peserta"}
                >
                  <RouteIcon color={isActive ? route.color : "neutral"} />
                  <span>{route.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </section>
    </main>
  );
}
