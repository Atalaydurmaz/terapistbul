export const dynamic = 'force-dynamic';

const DAILY_API = 'https://api.daily.co/v1';
const DAILY_KEY = process.env.DAILY_API_KEY;

// POST /api/panel/daily — room oluştur
// Body: { roomName, expiresAt? }
export async function POST(req) {
  try {
    const { roomName, expiresAt } = await req.json();

    if (!roomName) {
      return Response.json({ error: 'roomName gerekli' }, { status: 400 });
    }

    const body = {
      name: roomName,
      privacy: 'public',
      properties: {
        max_participants: 2,
        enable_chat: true,
        enable_screenshare: false,
        start_video_off: false,
        start_audio_off: false,
        lang: 'tr',
      },
    };

    if (expiresAt) {
      body.properties.exp = Math.floor(new Date(expiresAt).getTime() / 1000);
    }

    const res = await fetch(`${DAILY_API}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Daily.co room create error:', data);
      return Response.json({ error: data.error || 'Room oluşturulamadı' }, { status: res.status });
    }

    return Response.json({ url: data.url, name: data.name });
  } catch (err) {
    console.error('Daily route error:', err);
    return Response.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}

// DELETE /api/panel/daily?name=room-name — room sil
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) return Response.json({ error: 'name gerekli' }, { status: 400 });

    const res = await fetch(`${DAILY_API}/rooms/${name}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${DAILY_KEY}` },
    });

    if (!res.ok && res.status !== 404) {
      const data = await res.json();
      return Response.json({ error: data.error }, { status: res.status });
    }

    return Response.json({ deleted: true });
  } catch (err) {
    return Response.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
