import { put, list } from '@vercel/blob';

export default async function handler(request, response) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    console.error('Blob token is not set');
    return response.status(500).json({ error: 'Blob token is not set' });
  }

  if (request.method === 'POST') {
    try {
      let cycles = [];
      if (typeof request.body === 'string') {
        const parsed = JSON.parse(request.body);
        cycles = Array.isArray(parsed.cycles) ? parsed.cycles : [];
      } else if (typeof request.body === 'object' && Array.isArray(request.body.cycles)) {
        cycles = request.body.cycles;
      }

      console.log('Parsed cycles:', JSON.stringify(cycles, null, 2));

      const blob = await put('cycles.json', JSON.stringify(cycles), {
        access: 'public',
        token: token
      });

      console.log('Blob saved at URL:', blob.url);
      response.status(200).json({ message: 'Data saved', url: blob.url });
    } catch (error) {
      console.error('Error in POST handler:', error);
      response.status(400).json({ error: 'Invalid request body' });
    }
  } else if (request.method === 'GET') {
    try {
      const { blobs } = await list({ token });
      console.log('Blobs list:', blobs);

      // Filter blobs to only include those with the correct pathname
      const cyclesBlobs = blobs.filter(blob => blob.pathname === 'cycles.json');
      console.log('Filtered cycles blobs:', cyclesBlobs);

      if (cyclesBlobs.length > 0) {
        // Find the most recent blob by uploadedAt
        const latestBlob = cyclesBlobs.reduce((latest, blob) => {
          return new Date(latest.uploadedAt) > new Date(blob.uploadedAt) ? latest : blob;
        });

        console.log('Latest cycles blob:', latestBlob);

        const fetchResponse = await fetch(latestBlob.url);
        if (!fetchResponse.ok) {
          throw new Error(`Failed to fetch data: ${fetchResponse.status} ${fetchResponse.statusText}`);
        }
        const cycles = await fetchResponse.json();
        console.log('Retrieved cycles:', JSON.stringify(cycles, null, 2));
        response.status(200).json(Array.isArray(cycles) ? cycles : []);
      } else {
        console.log('No cycles found, returning empty array');
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
