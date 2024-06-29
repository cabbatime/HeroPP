import { put, list } from '@vercel/blob';

export default async function handler(request, response) {
  const token = process.env.REACT_APP_BLOB_READ_WRITE_TOKEN;

  if (!token) {
    console.error('Blob token is not set');
    return response.status(500).json({ error: 'Blob token is not set' });
  }

  if (request.method === 'POST') {
    try {
      // Log the raw request body
      console.log('Raw request body:', request.body);

      let cycles;
      if (typeof request.body === 'string') {
        cycles = JSON.parse(request.body);
      } else if (typeof request.body === 'object') {
        cycles = request.body;
      } else {
        throw new Error('Invalid request body format');
      }

      // Log the parsed cycles
      console.log('Parsed cycles:', cycles);

      const blob = await put('cycles.json', JSON.stringify(cycles), {
        access: 'public',
        token: token
      });
      response.status(200).json({ message: 'Data saved', url: blob.url });
    } catch (error) {
      console.error('Error in POST handler:', error);
      response.status(400).json({ error: 'Invalid request body' });
    }
  } else if (request.method === 'GET') {
    try {
      const { blobs } = await list({ token });
      const cyclesBlob = blobs.find(blob => blob.pathname === 'cycles.json');
      if (cyclesBlob) {
        const fetchResponse = await fetch(cyclesBlob.url);
        const cycles = await fetchResponse.json();
        response.status(200).json(cycles);
      } else {
        response.status(200).json([]);
      }
    } catch (error) {
      console.error('Error in GET handler:', error);
      response.status(500).json({ error: 'Failed to retrieve data' });
    }
  } else {
    response.status(405).json({ message: 'Method not allowed' });
  }
}