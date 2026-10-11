
import { createClient } from "npm:@supabase/supabase-js@2";

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed" },
      405,
    );
  }

  // 1. Read the device credential.
  const rawSecret = req.headers.get("x-device-key");

  if (!rawSecret || rawSecret.length > 256) {
    return jsonResponse(
      { error: "Unauthorized device" },
      401,
    );
  }

  // 2. Parse the request body.
  let body: {
    device_id?: string;
    sensor_code?: string;
    value?: number;
    measured_at?: string;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  // 3. Validate the payload.
  if (
    typeof body.device_id !== "string" ||
    !/^[A-Z0-9_-]{1,64}$/.test(body.device_id) ||
    typeof body.sensor_code !== "string" ||
    !/^[A-Z0-9_-]{1,64}$/.test(body.sensor_code) ||
    typeof body.value !== "number" ||
    !Number.isFinite(body.value)
  ) {
    return jsonResponse(
      { error: "Invalid reading data" },
      400,
    );
  }

  let measuredAt: string | undefined;

  if (body.measured_at !== undefined) {
    if (
      typeof body.measured_at !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T/.test(body.measured_at) ||
      !Number.isFinite(Date.parse(body.measured_at))
    ) {
      return jsonResponse(
        { error: "Invalid measured_at timestamp" },
        400,
      );
    }

    measuredAt = new Date(body.measured_at).toISOString();
  }

  // 4. Initialize the trusted server-side client.
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase environment variables");

    return jsonResponse(
      { error: "Server configuration error" },
      500,
    );
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey,
    { auth: { persistSession: false } },
  );

  // 5. Authenticate the ESP32.
  const keyHash = await sha256(rawSecret);

  const { data: device, error: deviceError } =
    await supabase
      .from("devices")
      .select("id")
      .eq("id", body.device_id)
      .eq("device_key_hash", keyHash)
      .eq("is_active", true)
      .maybeSingle();

  if (deviceError) {
    console.error("Device lookup failed:", deviceError.message);

    return jsonResponse(
      { error: "Device verification failed" },
      500,
    );
  }

  if (!device) {
    return jsonResponse(
      { error: "Unauthorized device" },
      401,
    );
  }

  // 6. Resolve and authorize the sensor.
  // The sensor must belong to this device and be active.
  const { data: sensor, error: sensorError } =
    await supabase
      .from("sensors")
      .select("id")
      .eq("device_id", device.id)
      .eq("sensor_code", body.sensor_code)
      .eq("is_active", true)
      .maybeSingle();

  if (sensorError) {
    console.error("Sensor lookup failed:", sensorError.message);

    return jsonResponse(
      { error: "Sensor verification failed" },
      500,
    );
  }

  if (!sensor) {
    return jsonResponse(
      { error: "Sensor not registered or inactive" },
      403,
    );
  }

  // 7. Insert the measurement.
  const readingData: {
    device_id: string;
    sensor_id: string;
    value: number;
    measured_at?: string;
  } = {
    device_id: device.id,
    sensor_id: sensor.id,
    value: body.value,
  };

  if (measuredAt !== undefined) {
    readingData.measured_at = measuredAt;
  }

  const { data: reading, error: insertError } =
    await supabase
      .from("sensor_readings")
      .insert(readingData)
      .select(
        "id, device_id, sensor_id, value, measured_at, created_at",
      )
      .single();

  if (insertError) {
    console.error("Reading insert failed:", insertError.message);

    return jsonResponse(
      { error: "Could not save reading" },
      500,
    );
  }

  // 8. Update device activity.
  const { error: updateError } = await supabase
    .from("devices")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", device.id);

  if (updateError) {
    // The reading has already been saved.
    console.error(
      "Last-seen update failed:",
      updateError.message,
    );
  }

  // 9. Return the saved measurement.
  return jsonResponse({
    success: true,
    reading,
  });
});

