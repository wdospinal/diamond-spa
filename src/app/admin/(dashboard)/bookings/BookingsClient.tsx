"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  hidesAdsAttribution,
  usesCompactHeader,
  type AdminRole,
} from "@/lib/admin-roles";
import type { BookingRecord } from "@/lib/booking-types";
import { bookingDisplayName } from "@/lib/booking-types";
import DualCurrency from "@/components/DualCurrency";

/** Sondeo de respaldo: solo se enciende si el stream en vivo no se sostiene. */
const POLL_INTERVAL_MS = 15000;

const EMPTY_MESSAGE =
  "Aún no hay reservas. Aparecerán aquí cuando un cliente confirme en la página de reservas.";

// Servicios curados que sí se pautan en Ads — mismo listado que la landing de campaña.
// Se hardcodea aquí (en vez de importar de @/lib/services) porque este componente
// corre en el cliente y ese archivo trae dependencias de servidor.
const AD_SERVICES = [
  { id: "relaxing", name: "Relajante" },
  { id: "deep-tissue", name: "Tejido Profundo" },
  { id: "sports", name: "Deportivo" },
  { id: "hot-stones", name: "Piedras Volcánicas" },
];

function AddLeadModal({
  onClose,
  onSaved,
  showAds,
}: {
  onClose: () => void;
  onSaved: () => void;
  showAds: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [gclid, setGclid] = useState("");
  const [adgroup, setAdgroup] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "completed" | "arrived" | "contacted" | "pending" | "cancelled"
  >("completed");
  const [paid, setPaid] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("El teléfono es obligatorio.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim(),
          serviceId: serviceId || undefined,
          gclid: gclid.trim() || undefined,
          adgroup: adgroup.trim() || undefined,
          notes: notes.trim() || undefined,
          status,
          paymentStatus: paid ? "paid" : "pending",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo guardar el lead.");
        setSaving(false);
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Error de red.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a1628] border border-[#1e3358] rounded-sm p-6 w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="font-headline text-xl text-[#cfe5fa]">Nuevo usuario</h2>
        <p className="text-[#8a9299] text-xs -mt-2">
          Para clientes que escribieron directo por WhatsApp, sin pasar por el
          wizard de reserva.
        </p>

        <div>
          <label className="block text-xs text-[#8a9299] mb-1">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-[#8a9299] mb-1">
            Teléfono *
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-[#8a9299] mb-1">Servicio</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none"
          >
            <option value="">No especificado</option>
            {AD_SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {showAds && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8a9299] mb-1">
                GCLID (Opcional)
              </label>
              <input
                value={gclid}
                onChange={(e) => setGclid(e.target.value)}
                placeholder="Opcional (Google empareja por teléfono)"
                className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none placeholder:text-[#8a9299]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8a9299] mb-1">
                Ad Group
              </label>
              <input
                value={adgroup}
                onChange={(e) => setAdgroup(e.target.value)}
                className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#8a9299] mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none"
            >
              <option value="pending">1. Nuevo Lead</option>
              <option value="contacted">2. En Chat</option>
              <option value="arrived">3. Cita Agendada</option>
              <option value="completed">4. Servicio Pagado</option>
              <option value="cancelled">5. Cancelado</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-[#cfe5fa]">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
              />
              Ya pagó
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8a9299] mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none"
          />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#8a9299] px-4 py-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="text-sm bg-[#4a9fd4] text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}

/** Punto de estado del stream en vivo — compartido por los dos encabezados. */
function LiveIndicator({ live }: { live: boolean }) {
  const label = live ? "En vivo" : "Reconectando…";
  return (
    <span
      className="flex items-center gap-1.5 text-[10px] font-label uppercase tracking-wider text-[#8a9299] shrink-0"
      aria-live="polite"
      title={label}
    >
      <span
        aria-hidden="true"
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          live ? "bg-[#22c55e] animate-pulse" : "bg-[#fbbf24]"
        }`}
      />
      {label}
    </span>
  );
}

type UpdateField = "status" | "paymentStatus";
type UpdateHandler = (id: string, field: UpdateField, value: string) => void;

function SourceBadge({ source }: { source: BookingRecord["source"] }) {
  return (
    <span
      className={`inline-flex px-2 py-1 rounded text-[10px] font-label uppercase tracking-wider ${
        source === "ads"
          ? "bg-[#4a9fd4]/20 text-[#4a9fd4]"
          : "bg-[#8a9299]/20 text-[#8a9299]"
      }`}
    >
      {source === "ads" ? "Ads" : "Orgánico"}
    </span>
  );
}

function StatusSelect({
  booking,
  disabled,
  onUpdate,
  className = "",
}: {
  booking: BookingRecord;
  disabled: boolean;
  onUpdate: UpdateHandler;
  className?: string;
}) {
  return (
    <select
      value={booking.status || "pending"}
      onChange={(e) => onUpdate(booking.id, "status", e.target.value)}
      disabled={disabled}
      aria-label={`Estado de la reserva de ${bookingDisplayName(booking) || "cliente"}`}
      className={`bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-xs rounded px-2 min-h-11 sm:min-h-0 sm:py-1 outline-none ${className}`}
    >
      <option
        value="pending"
        className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]"
      >
        1. Nuevo Lead
      </option>
      <option
        value="contacted"
        className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]"
      >
        2. En Conversación
      </option>
      <option
        value="arrived"
        className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]"
      >
        3. Cita Agendada
      </option>
      <option
        value="completed"
        className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]"
      >
        4. Servicio Pagado
      </option>
      <option
        value="cancelled"
        className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]"
      >
        5. Cancelado
      </option>
    </select>
  );
}

function PaymentControl({
  booking,
  disabled,
  onUpdate,
  className = "",
}: {
  booking: BookingRecord;
  disabled: boolean;
  onUpdate: UpdateHandler;
  className?: string;
}) {
  if (booking.paymentStatus && booking.paymentStatus !== "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-[#34d399] text-xs font-medium">
        <span
          className="material-symbols-outlined text-[14px]"
          aria-hidden="true"
        >
          check_circle
        </span>
        Pagado
      </span>
    );
  }
  return (
    <button
      onClick={() => onUpdate(booking.id, "paymentStatus", "paid")}
      disabled={disabled}
      className={`text-xs border border-[#34d399]/40 text-[#34d399] hover:bg-[#34d399]/10 px-3 min-h-11 sm:min-h-0 sm:py-1 rounded transition-colors disabled:opacity-50 ${className}`}
    >
      Marcar Pagado
    </button>
  );
}

/** Phone layout: one card per booking, so every field stays readable without
 *  the horizontal scrolling the eight-column table would require. */
function BookingCards({
  bookings,
  updatingId,
  onUpdate,
  showAds,
}: {
  bookings: BookingRecord[];
  updatingId: string | null;
  onUpdate: UpdateHandler;
  showAds: boolean;
}) {
  if (bookings.length === 0) {
    return (
      <p className="lg:hidden border border-[#42484c]/40 rounded-sm py-12 px-4 text-center text-[#8a9299]">
        {EMPTY_MESSAGE}
      </p>
    );
  }

  return (
    <ul className="lg:hidden flex flex-col gap-3">
      {bookings.map((b) => (
        <li
          key={b.id}
          className="border border-[#42484c]/40 rounded-sm p-4 flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[#cfe5fa] font-medium truncate">
                {bookingDisplayName(b) || "—"}
              </p>
              <p className="text-xs text-[#a5cce6]/90 mt-0.5">{b.phone}</p>
              {b.email && (
                <p className="text-[#8a9299] text-xs truncate">{b.email}</p>
              )}
            </div>
            <DualCurrency
              usd={b.price}
              copOverride={b.priceCop}
              tone={b.paymentStatus === "paid" ? "income" : "default"}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#cfe5fa]">
            <span className="tabular-nums">{b.dateKey}</span>
            <span className="text-[#42484c]" aria-hidden="true">
              ·
            </span>
            <span className="tabular-nums">{b.timeSlot}</span>
            {showAds && <SourceBadge source={b.source} />}
          </div>

          <div>
            <p className="text-sm text-[#cfe5fa]">{b.serviceName}</p>
            <p className="text-[#8a9299] text-xs">{b.duration}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#42484c]/25">
            <StatusSelect
              booking={b}
              disabled={updatingId === b.id}
              onUpdate={onUpdate}
              className="flex-1 min-w-[9rem] mt-3"
            />
            <PaymentControl
              booking={b}
              disabled={updatingId === b.id}
              onUpdate={onUpdate}
              className="mt-3"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function BookingsTable({
  bookings,
  onRefresh,
  showAds,
}: {
  bookings: BookingRecord[];
  onRefresh: () => void;
  showAds: boolean;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdate = async (
    id: string,
    field: UpdateField,
    value: string,
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        onRefresh();
      } else {
        alert("Error al actualizar");
      }
    } catch (e) {
      alert("Error de red");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section>
      <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#8a9299] mb-4">
        Sesiones reservadas ({bookings.length})
      </h2>

      <BookingCards
        bookings={bookings}
        updatingId={updatingId}
        onUpdate={handleUpdate}
        showAds={showAds}
      />

      <div className="hidden lg:block overflow-x-auto border border-[#42484c]/40 rounded-sm">
        <table className="w-full text-left text-sm font-body">
          <thead>
            <tr className="border-b border-[#42484c]/40 text-[#8a9299] font-label text-[10px] uppercase tracking-widest">
              <th className="py-3 px-4 font-medium">Fecha</th>
              <th className="py-3 px-4 font-medium">Hora</th>
              <th className="py-3 px-4 font-medium">Servicio</th>
              <th className="py-3 px-4 font-medium">Cliente / Contacto</th>
              {showAds && <th className="py-3 px-4 font-medium">Origen</th>}
              <th className="py-3 px-4 font-medium">Estado</th>
              <th className="py-3 px-4 font-medium">Pago</th>
              <th className="py-3 px-4 font-medium text-right">
                Precio
                <span className="block font-normal normal-case tracking-normal text-[9px] text-[#5c656d] mt-1">
                  USD · COP
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={showAds ? 8 : 7}
                  className="py-12 px-4 text-center text-[#8a9299]"
                >
                  {EMPTY_MESSAGE}
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-[#42484c]/25 text-[#cfe5fa] hover:bg-[#0a2438]/50"
                >
                  <td className="py-3 px-4 whitespace-nowrap">{b.dateKey}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{b.timeSlot}</td>
                  <td className="py-3 px-4">
                    <span className="block">{b.serviceName}</span>
                    <span className="text-[#8a9299] text-xs">{b.duration}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">
                      {bookingDisplayName(b) || "—"}
                    </div>
                    <div className="text-xs text-[#a5cce6]/90 mt-1">
                      {b.phone}
                    </div>
                    {b.email && (
                      <div className="text-[#8a9299] text-xs">{b.email}</div>
                    )}
                  </td>
                  {showAds && (
                    <td className="py-3 px-4">
                      <SourceBadge source={b.source} />
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <StatusSelect
                      booking={b}
                      disabled={updatingId === b.id}
                      onUpdate={handleUpdate}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <PaymentControl
                      booking={b}
                      disabled={updatingId === b.id}
                      onUpdate={handleUpdate}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <DualCurrency
                      usd={b.price}
                      copOverride={b.priceCop}
                      tone={b.paymentStatus === "paid" ? "income" : "default"}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import KanbanBoard from "@/components/admin/KanbanBoard";
import GoogleAdsFeedModal from "@/components/admin/GoogleAdsFeedModal";

export default function BookingsClient({ role }: { role: AdminRole }) {
  // Recepción ve solo la agenda: nada de GCLID, origen ni exportaciones.
  const showAds = !hidesAdsAttribution(role);
  // …y su encabezado se reduce a una fila: buscar · en vivo · nuevo usuario.
  const compactHeader = usesCompactHeader(role);
  const { replace, refresh } = useRouter();
  const [bookings, setBookings] = useState<BookingRecord[] | null | undefined>(
    undefined,
  );
  const [error, setError] = useState("");
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAdsModal, setShowAdsModal] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  // Stream SSE conectado — se refleja en el indicador "En vivo" del encabezado.
  const [live, setLive] = useState(false);
  // La búsqueda vive aquí porque el encabezado compacto la dibuja; el tablero
  // la recibe y no monta la suya.
  const [filterQuery, setFilterQuery] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/bookings", { credentials: "same-origin" });
    if (res.status === 401) {
      setBookings(null);
      replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setError("No se pudieron cargar las reservas.");
      setBookings([]);
      return;
    }
    const data = await res.json();
    setBookings(data.bookings ?? []);
  }, [replace]);

  useEffect(() => {
    void load();
    try {
      const saved = localStorage.getItem("admin_bookings_view");
      if (showAds && (saved === "table" || saved === "kanban")) {
        setViewMode(saved);
      }
    } catch {}
  }, [load, showAds]);

  // Tiempo real: el tablero lo miran varias personas a la vez (recepción,
  // terapeutas y quien gestiona la pauta), así que nunca hay que recargar.
  // `/api/bookings/stream` mantiene un Server-Sent Event abierto y empuja la
  // lista completa en cuanto cambia en el servidor; el estado se reemplaza sin
  // spinner, de modo que lo único que se ve moverse son las tarjetas.
  //
  // Si el stream no se puede sostener (red móvil, proxy que bufferiza, sesión
  // caducada) se enciende el sondeo de antes para que el tablero nunca quede
  // congelado, y se vuelve a intentar la conexión en vivo.
  useEffect(() => {
    let source: EventSource | null = null;
    let pollTimer: number | null = null;
    let reconnectTimer: number | null = null;
    let failures = 0;
    let stopped = false;
    // El servidor cierra el stream cada pocos minutos por el límite de la
    // función; cuando avisa, la reconexión es inmediata y no cuenta como caída.
    let rotating = false;

    const startPolling = () => {
      if (pollTimer !== null) return;
      pollTimer = window.setInterval(() => {
        if (document.visibilityState === "visible") void load();
      }, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (pollTimer === null) return;
      window.clearInterval(pollTimer);
      pollTimer = null;
    };

    const clearReconnect = () => {
      if (reconnectTimer === null) return;
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    };

    const scheduleReconnect = (delay: number) => {
      if (stopped || reconnectTimer !== null) return;
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    };

    function connect() {
      if (stopped) return;
      source?.close();
      const es = new EventSource("/api/bookings/stream");
      source = es;

      es.onopen = () => {
        failures = 0;
        setLive(true);
      };

      // `connect()` reemplaza `source`; una conexión vieja que aún dispare
      // eventos no debe tocar el estado.
      const isCurrent = () => source === es;

      es.addEventListener("bookings", (event) => {
        if (!isCurrent()) return; // trama tardía de una conexión ya relevada
        try {
          const data = JSON.parse((event as MessageEvent).data) as {
            bookings?: BookingRecord[];
          };
          if (Array.isArray(data.bookings)) {
            setBookings(data.bookings);
            setError("");
          }
        } catch {
          // Trama corrupta: se ignora, el próximo cambio manda la lista entera.
        }
        failures = 0;
        setLive(true);
        stopPolling();
      });

      es.addEventListener("rotate", () => {
        rotating = true;
        es.close();
        connect();
      });

      es.onerror = () => {
        if (rotating) return; // relevo planificado, ya hay conexión nueva
        setLive(false);
        failures += 1;
        // EventSource reintenta solo, pero a la segunda caída seguida ya
        // encendemos el sondeo para no dejar de ver cambios mientras tanto.
        if (failures >= 2) startPolling();
        // readyState CLOSED = el navegador se rindió (p. ej. un 401 por sesión
        // caducada). `load` redirige al login si toca; si no, reintentamos con
        // una espera que crece.
        if (es.readyState === EventSource.CLOSED) {
          void load();
          scheduleReconnect(Math.min(30000, 3000 * failures));
        }
      };
    }

    // Al volver a la pestaña: si el stream se cayó mientras estaba en segundo
    // plano, se reconecta y se refresca al instante en vez de esperar.
    const onWake = () => {
      if (document.visibilityState !== "visible") return;
      if (!source || source.readyState !== EventSource.OPEN) {
        void load();
        clearReconnect();
        connect();
      }
    };

    connect();
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);

    return () => {
      stopped = true;
      stopPolling();
      clearReconnect();
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
      source?.close();
    };
  }, [load]);

  const handleToggleView = (mode: "kanban" | "table") => {
    setViewMode(mode);
    try {
      localStorage.setItem("admin_bookings_view", mode);
    } catch {}
  };

  if (bookings === undefined && !error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center font-body text-[#8a9299]">
        Cargando…
      </div>
    );
  }
  if (bookings === null) return null;

  const addLeadButton = (
    <button
      onClick={() => setShowAddLead(true)}
      className="shrink-0 text-xs font-bold font-label uppercase tracking-wider bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#001524] px-3 py-2 md:px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
    >
      <span className="material-symbols-outlined text-[16px]">add_circle</span>
      <span className="hidden sm:inline">Nuevo usuario</span>
      <span className="sm:hidden">Nuevo</span>
    </button>
  );

  // Recepción: una sola fila con lo que de verdad usa. Sin título ni
  // descripción del pipeline, que solo ocupaban alto de pantalla en el móvil.
  if (compactHeader) {
    return (
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9299] text-base pointer-events-none"
              aria-hidden="true"
            >
              search
            </span>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Buscar por cliente, teléfono o servicio..."
              aria-label="Buscar reservas"
              className="w-full bg-[#071322] border border-[#1e3358] rounded-lg pl-9 pr-8 py-2 text-xs text-[#cfe5fa] placeholder:text-[#8a9299]/50 outline-none focus:border-[#38bdf8] transition-colors select-text"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 leading-none text-[#8a9299] hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <LiveIndicator live={live} />
          {addLeadButton}
        </header>

        {error ? (
          <p className="text-red-400/90 font-body mb-4">{error}</p>
        ) : null}

        <KanbanBoard
          bookings={bookings ?? []}
          onRefresh={load}
          role={role}
          externalSearch={{ query: filterQuery, onChange: setFilterQuery }}
        />

        {showAddLead && (
          <AddLeadModal
            onClose={() => setShowAddLead(false)}
            onSaved={load}
            showAds={showAds}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6 flex flex-col gap-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#38bdf8] text-xl shrink-0">
                account_tree
              </span>
              <h1 className="font-headline text-xl md:text-3xl text-[#cfe5fa] leading-tight">
                Pipeline de Ventas
              </h1>
            </div>
            <p className="text-[#8a9299] text-xs font-body">
              {showAds
                ? "Gestiona el embudo de clientes y sincroniza con Google Ads."
                : "Agenda de clientes: contacta, confirma y marca el servicio."}
            </p>
            {/* El tablero se actualiza solo; el indicador dice si el stream
                está abierto o si se está reintentando la conexión. */}
            <div className="mt-1.5">
              <LiveIndicator live={live} />
            </div>
          </div>

          {/* Primary action — always visible */}
          {addLeadButton}
        </div>

        {/* Secondary actions row — wraps on mobile. Recepción no ve ninguna
            de estas acciones, así que la fila entera desaparece. */}
        {showAds && (
          <div className="flex flex-wrap items-center gap-2">
            {/* View switcher */}
            <div className="flex items-center rounded-lg border border-[#1e3358] bg-[#071322] p-1 shadow-sm">
              <button
                type="button"
                onClick={() => handleToggleView("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold font-label uppercase tracking-wider transition-all ${
                  viewMode === "kanban"
                    ? "bg-[#1a3860] text-[#38bdf8] shadow-md border border-[#38bdf8]/30"
                    : "text-[#8a9299] hover:text-[#cfe5fa] hover:bg-[#0f243e]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  view_kanban
                </span>
                <span className="hidden sm:inline">Tablero</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleView("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold font-label uppercase tracking-wider transition-all ${
                  viewMode === "table"
                    ? "bg-[#1a3860] text-[#38bdf8] shadow-md border border-[#38bdf8]/30"
                    : "text-[#8a9299] hover:text-[#cfe5fa] hover:bg-[#0f243e]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  table_rows
                </span>
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>

            {/* Google Ads connect */}
            <button
              onClick={() => setShowAdsModal(true)}
              className="text-xs font-bold font-label uppercase tracking-wider bg-[#1a3860] hover:bg-[#254e85] text-[#38bdf8] border border-[#38bdf8]/30 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Ver enlaces de conexión automática HTTPS para Google Ads"
            >
              <span className="material-symbols-outlined text-[16px]">
                sync
              </span>
              <span className="hidden sm:inline">Conectar Google Ads</span>
              <span className="sm:hidden">Google Ads</span>
            </button>

            {/* Export group */}
            <div className="flex items-center rounded-lg border border-[#1e3358] bg-[#071322] overflow-hidden shadow-sm ml-auto">
              <a
                href="/api/admin/bookings/export?type=all"
                className="text-xs font-bold font-label uppercase tracking-wider text-[#cfe5fa] hover:bg-[#1a3860] px-2.5 py-2 transition-colors border-r border-[#1e3358]"
                title="Exporta todas las conversiones combinadas para Google Ads"
              >
                <span className="hidden sm:inline">Exportar Ads</span>
                <span className="sm:hidden">Ads</span>
              </a>
              <a
                href="/api/admin/bookings/export?type=qualified"
                className="text-xs font-bold font-label uppercase tracking-wider text-[#a855f7] hover:bg-[#1a3860] px-2.5 py-2 transition-colors border-r border-[#1e3358]"
                title="Exporta solo Leads Cualificados (Cita Agendada)"
              >
                <span className="hidden sm:inline">Cualificados</span>
                <span className="sm:hidden">Cual.</span>
              </a>
              <a
                href="/api/admin/bookings/export?type=converted"
                className="text-xs font-bold font-label uppercase tracking-wider text-[#22c55e] hover:bg-[#1a3860] px-2.5 py-2 transition-colors"
                title="Exporta solo Ventas Pagadas con valor COP"
              >
                Ventas
              </a>
            </div>
          </div>
        )}
      </header>

      {error ? <p className="text-red-400/90 font-body mb-6">{error}</p> : null}

      {viewMode === "kanban" || !showAds ? (
        <KanbanBoard bookings={bookings ?? []} onRefresh={load} role={role} />
      ) : (
        <BookingsTable
          bookings={bookings ?? []}
          onRefresh={load}
          showAds={showAds}
        />
      )}

      {showAddLead && (
        <AddLeadModal
          onClose={() => setShowAddLead(false)}
          onSaved={load}
          showAds={showAds}
        />
      )}

      {showAdsModal && (
        <GoogleAdsFeedModal onClose={() => setShowAdsModal(false)} />
      )}
    </div>
  );
}
