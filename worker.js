const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
    if (!allowed.includes(origin)) {
      return Response.json({ success: false, message: "Origin not allowed" }, { status: 403 });
    }
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") {
      return Response.json({ success: false, message: "Method not allowed" }, { status: 405, headers });
    }

    try {
      const body = await request.json();
      const fio = String(body.fio || "").trim();
      const phone = String(body.phone || "").replace(/\D/g, "");
      const address = String(body.address || "").trim();

      if (!fio || fio.length > 255 || !/^[6-9]\d{9}$/.test(phone) || address.length > 255) {
        return Response.json({ success: false, message: "कृपया नाम, सही मोबाइल नंबर और पता जाँचें।" }, { status: 400, headers });
      }
      if (!env.LEADVERTEX_TOKEN) {
        return Response.json({ success: false, message: "Backend token configured नहीं है।" }, { status: 500, headers });
      }

      const endpoint = new URL("https://kohinoorplus.leadvertex.ru/api/webmaster/v2/addOrder.html");
      endpoint.searchParams.set("webmasterID", "28");
      endpoint.searchParams.set("token", env.LEADVERTEX_TOKEN);

      const payload = new URLSearchParams();
      payload.set("fio", fio);
      payload.set("phone", phone);
      payload.set("country", "India");
      if (address) payload.set("address", address);
      payload.set("price", env.ORDER_PRICE || "2250");
      payload.set("total", env.ORDER_PRICE || "2250");
      payload.set("quantity", "1");
      payload.set("timezone", String(new Date().getTimezoneOffset()));
      payload.set("domain", env.LEAD_DOMAIN || "github-pages");
      payload.set("utm_source", "github_form");
      payload.set("utm_medium", "website");
      payload.set("utm_campaign", "kohinoor_plus");
      payload.set("externalID", String(Date.now()));

      // Optional: configure GOOD_ID only after confirming the Kohinoor Plus product ID.
      const GOOD_ID = "184285"; // Kohinoor Plus product ID supplied by user
      if (GOOD_ID) {
        payload.set("goods[0][goodID]", GOOD_ID);
        payload.set("goods[0][quantity]", "1");
        payload.set("goods[0][price]", env.ORDER_PRICE || "2250");
      }

      const upstream = await fetch(endpoint.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString()
      });
      const raw = await upstream.text();
      let result;
      try { result = JSON.parse(raw); } catch { result = { raw }; }

      if (!upstream.ok || !result || !result.OK) {
        return Response.json({
          success: false,
          message: "LeadVertex ने Lead स्वीकार नहीं की। कृपया backend logs में error देखें।"
        }, { status: 502, headers });
      }

      return Response.json({ success: true, orderId: String(result.OK) }, { status: 200, headers });
    } catch (e) {
      return Response.json({ success: false, message: "Request process नहीं हो सकी।" }, { status: 500, headers });
    }
  }
};
