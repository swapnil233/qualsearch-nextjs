import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { transcriptId, speakerIndex, name } = req.body;

        try {
            const updatedSpeakerName = await prisma.speakerName.upsert({
                where: {
                    transcriptId_speakerIndex: {
                        transcriptId: transcriptId,
                        speakerIndex: parseInt(speakerIndex),
                    },
                },
                update: { name },
                create: {
                    transcriptId: transcriptId as string,
                    speakerIndex: parseInt(speakerIndex),
                    name,
                },
            });

            res.status(200).json(updatedSpeakerName);
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Failed to update speaker name' });
        }
    } else if (req.method === 'GET') {
        const { transcriptId } = req.query;
        console.log(`Transcript id: ${transcriptId}`)

        try {
            const speakerNames = await prisma.speakerName.findMany({
                where: { transcriptId: transcriptId as string },
            });

            res.status(200).json(speakerNames);
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Failed to fetch speaker names' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}