const speakeasy = require("speakeasy");

const STEP_SECONDS = 30 * 60;
const DIGITS = 6;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

  const SECRET = process.env.GATE_OTP_SECRET;
  if (!SECRET) return res.status(500).json({ ok: false, error: "Missing GATE_OTP_SECRET" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch {}
  }

  const userCode = String(body?.code || "").trim();
  if (!/^\d{6}$/.test(userCode)) {
    return res.status(400).json({ ok: false, error: "Code must be 6 digits" });
  }

  const valid = speakeasy.totp.verify({
    secret: SECRET,
    encoding: "ascii",
    token: userCode,
    digits: DIGITS,
    step: STEP_SECONDS,
    window: 1,
  });

  return res.json({
    ok: true,
    valid,
    message: valid ? "✅ Verified" : "❌ Rejected",
  });
};
