/**
 * PLACEHOLDER — HiveMQ (MQTT over WebSocket) live readings.
 *
 * Nothing here connects yet; the functions only log. The `mqtt` package is
 * intentionally NOT installed.
 *
 * Env vars (see .env.example):
 *   VITE_HIVEMQ_URL       wss://<cluster>.s1.eu.hivemq.cloud:8884/mqtt
 *   VITE_HIVEMQ_USERNAME  broker username
 *   VITE_HIVEMQ_PASSWORD  broker password
 *   VITE_HIVEMQ_TOPIC     e.g. smartlpg/<deviceId>/readings
 *
 * ⚠ Security: every VITE_* variable is bundled into public JavaScript, so
 * broker credentials in the browser are visible to anyone. Preferred design:
 * ESP32 → HiveMQ → Express backend (subscribes server-side) → Firebase →
 * frontend (via API polling, Firestore listeners, or SSE/WebSocket from the
 * backend). Only use direct browser MQTT with a read-only, topic-scoped
 * credential.
 *
 * Future implementation sketch:
 *   import mqtt from 'mqtt'
 *   client = mqtt.connect(url, { username, password, reconnectPeriod: 5000 })
 *   client.on('message', (topic, payload) => handler(JSON.parse(payload)))
 */

const config = {
  url: import.meta.env.VITE_HIVEMQ_URL,
  username: import.meta.env.VITE_HIVEMQ_USERNAME,
  topic: import.meta.env.VITE_HIVEMQ_TOPIC,
}

export function connect() {
  console.info('[mqttService] connect() is a placeholder. Target broker:', config.url ?? '(not set)')
  return Promise.resolve(false)
}

/** @param {(reading: object) => void} onMessage  @returns {() => void} unsubscribe */
export function subscribe(topic = config.topic, onMessage) {
  console.info('[mqttService] subscribe() is a placeholder. Topic:', topic ?? '(not set)')
  void onMessage
  return () => {}
}

export function disconnect() {
  console.info('[mqttService] disconnect() is a placeholder.')
}
