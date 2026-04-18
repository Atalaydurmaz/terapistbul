import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const MESSAGES_FILE = join(process.cwd(), 'src', 'data', 'messages.json');

export async function DELETE(req, { params }) {
  try {
    const { id: idParam } = await params;
    const messages = JSON.parse(readFileSync(MESSAGES_FILE, 'utf8'));
    const id = Number(idParam);
    const filtered = messages.filter((m) => m.id !== id);
    writeFileSync(MESSAGES_FILE, JSON.stringify(filtered, null, 2));
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Silinemedi.' }, { status: 500 });
  }
}
