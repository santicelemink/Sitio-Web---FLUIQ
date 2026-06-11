/* ============================================================
   FLUIQ — Backend serverless para captura de leads
   ------------------------------------------------------------
   Recibe el formulario, valida del lado del servidor, guarda en
   Supabase (opcional) y envía una notificación por email (Resend).

   Sin dependencias npm: usa fetch nativo (Node 18+ en Netlify).

   Variables de entorno necesarias (configurar en Netlify -> Site
   settings -> Environment variables):
     RESEND_API_KEY            (requerida para email)
     NOTIFY_EMAIL              destino de la notificacion  (default: santicelemink@gmail.com)
     FROM_EMAIL                remitente verificado en Resend (default: onboarding@resend.dev)
     SUPABASE_URL              (opcional - para guardar leads)
     SUPABASE_SERVICE_ROLE_KEY (opcional - clave service_role)
     ALLOWED_ORIGIN            (opcional - restringe CORS al dominio real)
   ============================================================ */

"use strict";

var NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "santicelemink@gmail.com";
var FROM_EMAIL = process.env.FROM_EMAIL || "FLUIQ <onboarding@resend.dev>";
var ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

var MAX_BODY = 8 * 1024; // 8 KB maximo de payload
var EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

/* ---------- Helpers ---------- */
function cors() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
}

function json(statusCode, obj) {
  return { statusCode: statusCode, headers: cors(), body: JSON.stringify(obj) };
}

// Escapar HTML para evitar inyeccion en el cuerpo del email
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Limpiar caracteres de control y limitar longitud de un campo de texto
function clean(v, max) {
  if (typeof v !== "string") return "";
  var ctrl = new RegExp("[\\u0000-\\u001F\\u007F]", "g");
  return v.replace(ctrl, " ").trim().slice(0, max || 200);
}

/* ---------- Handler ---------- */
exports.handler = async function (event) {
  // Preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Metodo no permitido" });
  }

  // Limite de tamano del cuerpo
  if (event.body && event.body.length > MAX_BODY) {
    return json(413, { ok: false, error: "Payload demasiado grande" });
  }

  var data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { ok: false, error: "JSON invalido" });
  }

  // 1. Honeypot: campo trampa completado = bot
  if (data.website && String(data.website).trim() !== "") {
    // Respondemos 200 para no revelar la trampa, pero no procesamos nada
    return json(200, { ok: true });
  }

  // 2. Velocidad de llenado: < 1.5 s = probable bot
  var elapsed = Number(data.elapsedMs);
  if (isFinite(elapsed) && elapsed > 0 && elapsed < 1500) {
    return json(200, { ok: true });
  }

  // 3. Validacion de campos del lado del servidor
  var nombre = clean(data.nombre, 80);
  var email = clean(data.email, 120);
  var consultora = clean(data.consultora, 120);
  var mensaje = clean(data.mensaje, 1000);
  var tamano = clean(data.tamano, 80);
  var dolor = clean(data.dolor, 120);
  var origen = clean(data.origen, 40) || "sitio";

  var errors = [];
  if (nombre.length < 2) errors.push("nombre");
  if (!EMAIL_RE.test(email)) errors.push("email");
  if (consultora.length < 2) errors.push("consultora");
  if (errors.length) {
    return json(422, { ok: false, error: "Datos invalidos", fields: errors });
  }

  var ip =
    (event.headers["x-nf-client-connection-ip"] ||
      event.headers["x-forwarded-for"] ||
      "").split(",")[0].trim();
  var userAgent = clean(event.headers["user-agent"], 200);
  var createdAt = new Date().toISOString();

  var lead = {
    nombre: nombre,
    email: email,
    consultora: consultora,
    mensaje: mensaje,
    tamano: tamano || null,
    dolor: dolor || null,
    origen: origen,
    ip: ip || null,
    user_agent: userAgent || null,
    created_at: createdAt
  };

  // 4. Rate-limiting por IP via Supabase (si esta configurado)
  var supaUrl = process.env.SUPABASE_URL;
  var supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  var stored = false;

  if (supaUrl && supaKey && ip) {
    try {
      var since = new Date(Date.now() - 60 * 1000).toISOString();
      var checkUrl =
        supaUrl.replace(/\/$/, "") +
        "/rest/v1/leads?select=id&ip=eq." +
        encodeURIComponent(ip) +
        "&created_at=gte." +
        encodeURIComponent(since);
      var recent = await fetch(checkUrl, {
        headers: { apikey: supaKey, Authorization: "Bearer " + supaKey }
      });
      if (recent.ok) {
        var rows = await recent.json();
        if (Array.isArray(rows) && rows.length >= 3) {
          return json(429, { ok: false, error: "Demasiados envios. Proba en un minuto." });
        }
      }
    } catch (e) {
      // No bloqueamos el flujo si la verificacion falla
    }
  }

  // 5. Guardar en Supabase
  if (supaUrl && supaKey) {
    try {
      var insertRes = await fetch(supaUrl.replace(/\/$/, "") + "/rest/v1/leads", {
        method: "POST",
        headers: {
          apikey: supaKey,
          Authorization: "Bearer " + supaKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(lead)
      });
      stored = insertRes.ok;
    } catch (e) {
      stored = false;
    }
  }

  // 6. Notificacion por email via Resend
  var emailed = false;
  var resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    var html =
      '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1A2A39">' +
      '<h2 style="color:#E8703A;margin:0 0 12px">Nuevo lead desde el sitio FLUIQ</h2>' +
      '<table style="border-collapse:collapse">' +
      row("Nombre", nombre) +
      row("Email", email) +
      row("Consultora", consultora) +
      (tamano ? row("Tamano", tamano) : "") +
      (dolor ? row("Punto de friccion", dolor) : "") +
      (mensaje ? row("Mensaje", mensaje) : "") +
      row("Origen", origen) +
      row("Fecha", createdAt) +
      (ip ? row("IP", ip) : "") +
      "</table></div>";

    try {
      var sendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + resendKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [NOTIFY_EMAIL],
          reply_to: email,
          subject: "Nuevo lead FLUIQ - " + nombre + " (" + consultora + ")",
          html: html
        })
      });
      emailed = sendRes.ok;
    } catch (e) {
      emailed = false;
    }
  }

  // Si no se pudo ni guardar ni notificar, es un error real del servidor
  if (!stored && !emailed) {
    return json(502, {
      ok: false,
      error: "No se pudo procesar el envio. Intenta de nuevo o escribinos por WhatsApp."
    });
  }

  return json(200, { ok: true, stored: stored, emailed: emailed });
};

function row(label, value) {
  return (
    '<tr><td style="padding:4px 14px 4px 0;color:#52606D;font-weight:bold;vertical-align:top">' +
    esc(label) +
    '</td><td style="padding:4px 0">' +
    esc(value) +
    "</td></tr>"
  );
}
