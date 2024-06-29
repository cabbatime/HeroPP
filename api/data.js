import { put, list } from '@vercel/blob';

export default async function handler(request, response) {
  const token = process.env.REACT_APP_BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return response.status(500).json({ error: 'Blob token is not set' });
  }

  if (request.method === 'POST') {
    // Save data
    const { cycles } = JSON.parse(request.body);
    const blob = await put('cycles.json', JSON.stringify(cycles), {
      access: 'public',
      token: token
    });
    response.status(200).json({ message: 'Data saved', url: blob.url });
  } else if (request.method === 'GET') {
    // Retrieve data
    const { blobs } = await list({ token });
    const cyclesBlob = blobs.find(blob => blob.pathname === 'cycles.json');
    if (cyclesBlob) {
      const fetchResponse = await fetch(cyclesBlob.url);
      const cycles = await fetchResponse.json();
      response.status(200).json(cycles);
    } else {
      response.status(200).json([]);
    }
  } else {
    response.status(405).json({ message: 'Method not allowed' });
  }
}