const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isAllowedCollegeEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  return normalizeEmail(email).endsWith("@mietjammu.in");
}

function makeVerificationToken(email) {
  const secret = process.env.JWT_SECRET || "jwt_secret";
  return jwt.sign({ email, purpose: "email_verification" }, secret, { expiresIn: "15m" });
}

function pickFirst(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
}

function extractUser(pi360Body) {
  // PI-360 responses differ by integration; try a few common nestings first.
  const candidates = [
    pi360Body?.user,
    pi360Body?.student,
    pi360Body?.data,
    pi360Body
  ].filter(Boolean);

  for (const user of candidates) {
    const name = pickFirst(user, [
      "name",
      "fullName",
      "full_name",
      "studentName",
      "student_name",
      "user_name",
      "username"
    ]);
    const email = pickFirst(user, [
      "email",
      "userEmail",
      "user_email",
      "studentEmail",
      "student_email",
      "username_1", // sometimes PI-360 echoes the username here
      "username"
    ]);
    const dept = pickFirst(user, [
      "dept",
      "department",
      "departmentName",
      "department_name",
      "branch",
      "course",
      "stream"
    ]);

    if (email || name || dept) {
      return { name, email, dept };
    }
  }

  return { name: "", email: "", dept: "" };
}

function isEmailLike(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(value || "").trim());
}

function findFirstEmail(pi360Body) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const seen = new Set();

  function walk(node) {
    if (!node) return "";
    if (typeof node !== "object") {
      if (typeof node === "string" && emailRegex.test(node.trim())) return node.trim();
      return "";
    }
    if (seen.has(node)) return "";
    seen.add(node);

    for (const k of Object.keys(node)) {
      const v = node[k];
      if (!v) continue;
      if (typeof v === "string" && emailRegex.test(v.trim())) return v.trim();
      const found = walk(v);
      if (found) return found;
    }
    return "";
  }

  return walk(pi360Body);
}

// POST /api/pi360/login
// Body: { id: string, password: string }
// Returns: { token, user: { name, email, dept } }
router.get("/pi360/ping", (req, res) => {
  return res.json({ ok: true, route: "pi360Auth" });
});

router.post("/pi360/login", async (req, res) => {
  try {
    const id = String(req.body?.id || req.body?.studentId || "").trim();
    const password = String(req.body?.password || req.body?.pass || "").trim();
    if (!id || !password) {
      return res.status(400).json({ error: "PI-360 login requires id and password" });
    }

    const loginUrl = process.env.PI360_API_URL || process.env.PI360_LOGIN_URL;
    if (!loginUrl) {
      return res.status(500).json({
        error: "PI-360 is not configured. Set PI360 API URL in backend .env"
      });
    }

    // PI-360 login expects institute_id as a query param (required),
    // and a JSON body containing username_1/password_1/fcm_token.
    const instituteId = String(process.env.PI360_INSTITUTE_ID || "").trim();
    const fcmToken = String(req.body?.fcm_token || process.env.PI360_FCM_TOKEN || "")
      .trim() || "test_fcm_token_123";

    if (!instituteId) {
      return res.status(500).json({ error: "PI-360 institute_id is not configured" });
    }

    // Node 18+ supports fetch in most environments.
    if (typeof fetch !== "function") {
      return res.status(500).json({
        error: "Server runtime does not support fetch(). Upgrade Node.js or add a fetch polyfill."
      });
    }

    const url = `${loginUrl}${loginUrl.includes("?") ? "&" : "?"}institute_id=${encodeURIComponent(instituteId)}`;

    const pi360Res = await fetch(url, {
      method: process.env.PI360_LOGIN_METHOD || "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username_1: id,
        password_1: password,
        fcm_token: fcmToken
      })
    });

    const raw = await pi360Res.text().catch(() => "");
    let pi360Body = {};
    let parsedJson = false;
    if (raw) {
      try {
        pi360Body = JSON.parse(raw);
        parsedJson = true;
      } catch (e) {
        // Some PI-360 deployments return non-JSON strings; keep pi360Body as {}.
        pi360Body = {};
      }
    }

    // If PI-360 returned an HTML fatal error, this is not a real auth success.
    const rawText = String(raw || "");
    if (rawText.includes("Fatal error") || rawText.includes("Uncaught Error")) {
      return res.status(502).json({
        error: "PI-360 server returned a fatal error",
        pi360Preview: rawText.slice(0, 400)
      });
    }

    // PI-360 often returns HTTP 200 even for failures; respect statusCode/message if present.
    const statusCode = pi360Body?.statusCode ?? pi360Body?.StatusCode ?? null;
    if (statusCode !== null && statusCode !== undefined) {
      const sc = Number(statusCode);
      if (Number.isFinite(sc) && sc !== 200) {
        return res.status(401).json({
          error: "PI-360 authentication failed",
          pi360: {
            statusCode: sc,
            message: pi360Body?.message || pi360Body?.msg || "Authentication failed"
          },
          pi360BodyPreview: String(raw || "").slice(0, 300)
        });
      }
    }

    if (!pi360Res.ok) {
      // PI-360 errors can vary; surface a generic message + whatever PI-360 returned.
      return res.status(pi360Res.status === 401 ? 401 : 400).json({
        error: pi360Body?.error || pi360Body?.message || "PI-360 authentication failed"
      });
    }

    if (pi360Body?.success === false || pi360Body?.status === false) {
      return res.status(401).json({
        error: pi360Body?.error || pi360Body?.message || "PI-360 authentication failed"
      });
    }

    const user = extractUser(pi360Body);

    // Extract email from multiple possible sources:
    // 1) extracted user.email
    // 2) any email-like value inside the PI-360 JSON
    // 3) fallback to the provided login `id` if it looks like an email
    let normalizedEmail = normalizeEmail(user.email);
    if (!normalizedEmail) normalizedEmail = normalizeEmail(findFirstEmail(pi360Body));
    if (!normalizedEmail && isEmailLike(id)) normalizedEmail = normalizeEmail(id);

    if (!normalizedEmail) {
      return res.status(401).json({
        error: "PI-360 did not return an email",
        debug: {
          extractedUser: user,
          pi360BodyPreview: JSON.stringify(pi360Body).slice(0, 300)
        }
      });
    }
    if (!isAllowedCollegeEmail(normalizedEmail)) {
      return res.status(400).json({
        error: "Only official college email IDs are allowed for booking."
      });
    }

    const token = makeVerificationToken(normalizedEmail);

    // Debug: print a single line on successful login so we can map PI-360 response.
    console.log(
      "PI-360 login success:",
      JSON.stringify({
        status: pi360Res.status,
        parsedJson,
        rawPreview: String(raw || "").slice(0, 500)
      })
    );

    const finalName =
      String(user.name || "").trim() ||
      (normalizedEmail ? normalizedEmail.split("@")[0] : "") ||
      String(id || "").split("@")[0] ||
      "Student";

    return res.json({
      token,
      user: {
        name: finalName,
        email: normalizedEmail,
        dept: String(user.dept || "").trim()
      }
    });
  } catch (err) {
    console.error("ERROR /api/pi360/login:", err);
    return res.status(500).json({ error: "PI-360 login failed" });
  }
});

module.exports = router;

