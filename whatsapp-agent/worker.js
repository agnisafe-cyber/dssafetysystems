const BUSINESS = {
  name: "DS Safety Systems",
  phone: "+91 98187 01683",
  whatsapp: "919818701683",
  address: "Ground floor, Kalka Ji, 1420/13, Block 4, Govindpuri Extension, Chittaranjan Park, New Delhi, Delhi 110019",
  hours: "Daily, 9:00 AM–9:00 PM (as listed on Google Business Profile)",
  website: "https://agnisafe-cyber.github.io/dssafetysystems/",
  products: "ABC dry-powder fire extinguishers are available in 2 kg, 4 kg, 6 kg and 9 kg capacities. Other fire-safety products and services are subject to confirmation."
};

const SYSTEM_PROMPT = `You are the WhatsApp customer-support assistant for ${BUSINESS.name}, a fire-safety equipment supplier in New Delhi, India.
Business facts:
- Phone/WhatsApp: ${BUSINESS.phone}
- Address: ${BUSINESS.address}
- Listed hours: ${BUSINESS.hours}
- Website: ${BUSINESS.website}
- Products: ${BUSINESS.products}
Be polite, concise, and helpful. Reply in the customer's language when clear (English or Hindi).
Answer only from these facts. Never invent prices, stock, delivery promises, certifications, appointment slots, warranty terms, or technical guarantees. For uncertain product suitability or safety-critical questions, ask the customer to speak to the team.
For booking/enquiry requests, collect one detail at a time: customer name, required product/service, quantity or capacity, preferred date/time, and delivery/site address. Summarize the request and say it is an enquiry request awaiting team confirmation—not a confirmed appointment or order.
For emergencies, tell the customer to contact local emergency services immediately; do not delay them with sales questions.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/webhook") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      if (mode === "subscribe" && token && token === env.WHATSAPP_VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      }
      return new Response("Forbidden", { status: 403 });
    }
    if (request.method === "GET" && url.pathname === "/") {
      return Response.json({ service: "DS Safety Systems WhatsApp assistant", status: "running" });
    }
    if (request.method !== "POST" || url.pathname !== "/webhook") {
      return new Response("Not found", { status: 404 });
    }

    let payload;
    try { payload = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
    const entry = payload?.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];
    if (!message || message.type !== "text") return new Response("EVENT_RECEIVED", { status: 200 });

    const from = message.from;
    const text = (message.text?.body || "").trim();
    if (!from || !text) return new Response("EVENT_RECEIVED", { status: 200 });

    try {
      const reply = await generateReply(from, text, env);
      await sendWhatsApp(from, reply, env);
    } catch (error) {
      console.error("WhatsApp handler error:", error);
      await sendWhatsApp(from, "Thanks for contacting DS Safety Systems. We received your message. Please call +91 98187 01683 for assistance.", env);
    }
    return new Response("EVENT_RECEIVED", { status: 200 });
  }
};

async function generateReply(userId, incoming, env) {
  const key = `chat:${userId}`;
  const previous = await env.CHAT_STATE.get(key, "json") || [];
  const history = [...previous, { role: "user", content: incoming }].slice(-12);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 350,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history]
    })
  });
  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Empty assistant reply");
  await env.CHAT_STATE.put(key, JSON.stringify([...history, { role: "assistant", content: reply }].slice(-12)), { expirationTtl: 60 * 60 * 24 * 14 });
  return reply;
}

async function sendWhatsApp(to, body, env) {
  const response = await fetch(`https://graph.facebook.com/v21.0/${env.PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: String(body).slice(0, 4000) }
    })
  });
  if (!response.ok) throw new Error(`WhatsApp API error: ${response.status} ${await response.text()}`);
}
