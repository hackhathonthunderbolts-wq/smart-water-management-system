
import { createClient } from "npm:@supabase/supabase-js@2";

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 },
    );
  }

  const rawSecret = req.headers.get("x-device-key");

  if (!rawSecret || rawSecret.length > 256) {
    return Response.json(
      { error: "Unauthorized device" },
      { status: 401 },
    );
  }

  let body: {
    device_id?: string;
    raw_reading?: number;
    leak_detected?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (
    typeof body.device_id !== "string" ||
    !/^[A-Z0-9_-]{1,64}$/.test(body.device_id) ||
    typeof body.raw_reading !== "number" ||
    !Number.isInteger(body.raw_reading) ||
    body.raw_reading < 0 ||
    body.raw_reading > 4095 ||
    typeof body.leak_detected !== "boolean"
  ) {
    return Response.json(
      { error: "Invalid reading data" },
      { status: 400 },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const keyHash = await sha256(rawSecret);

  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("id")
    .eq("id", body.device_id)
    .eq("device_key_hash", keyHash)
    .eq("is_active", true)
    .maybeSingle();

  if (deviceError) {
    console.error("Device lookup failed:", deviceError.message);

    return Response.json(
      { error: "Device verification failed" },
      { status: 500 },
    );
  }

  if (!device) {
    return Response.json(
      { error: "Unauthorized device" },
      { status: 401 },
    );
  }

  const { data: reading, error: insertError } = await supabase
    .from("sensor_readings")
    .insert({
      device_id: device.id,
      raw_reading: body.raw_reading,
      leak_detected: body.leak_detected,
    })
    .select("id, device_id, created_at")
    .single();

  if (insertError) {
    console.error("Reading insert failed:", insertError.message);

    return Response.json(
      { error: "Could not save reading" },
      { status: 500 },
    );
  }

  const { error: updateError } = await supabase
    .from("devices")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", device.id);

  if (updateError) {
    console.error("Last-seen update failed:", updateError.message);
  }

  return Response.json({
    success: true,
    reading,
  });
});

