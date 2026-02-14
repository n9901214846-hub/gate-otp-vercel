const speakeasy = require("speakeasy");

const STEP_SECONDS = 30 * 60; // 30 minutes
const DIGITS = 6;

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false });

  const SECRET = process.env.GATE_OTP_SECRET;
  if (!SECRET) {
    return res.status(500).json({ ok: false, error: "Missing GATE_OTP_SECRET" });
  }

  const now = Date.now();

  const code = speakeasy.totp({
    secret: SECRET,
    encoding: "ascii",
    digits: DIGITS,
    step: STEP_SECONDS,
  });

  const nowSec = Math.floor(now / 1000);
  const mod = nowSec % STEP_SECONDS;
  const remainingSeconds = STEP_SECONDS - mod;

  res.setHeader("Cache-Control", "no-store");

  return res.json({
    ok: true,
    code,
    remainingSeconds,
    serverTime: new Date(now).toISOString(),
  });
};
