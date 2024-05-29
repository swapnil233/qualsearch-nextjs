import { ErrorMessages } from '@/constants/ErrorMessages';
import { HttpStatus } from '@/constants/HttpStatus';
import { getInvitationById, updateInvitationStatus } from '@/infrastructure/services/invitation.service';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(HttpStatus.MethodNotAllowed).json({ error: ErrorMessages.MethodNotAllowed });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(HttpStatus.Unauthorized).json({ error: ErrorMessages.Unauthorized });
    }

    const { invitationId } = req.body;
    if (!invitationId) {
        return res.status(HttpStatus.BadRequest).json({ error: ErrorMessages.BadRequest });
    }

    try {
        const invitation = await getInvitationById(invitationId);
        if (!invitation) {
            return res.status(HttpStatus.NotFound).json({ error: ErrorMessages.NotFound });
        }

        if (invitation.invitedEmail !== session.user.email) {
            return res.status(HttpStatus.Unauthorized).json({ error: ErrorMessages.Unauthorized });
        }

        const updatedInvitation = await updateInvitationStatus(invitationId, 'DECLINED');

        return res.status(HttpStatus.Ok).json({ invitation: updatedInvitation });
    } catch (error) {
        console.error('Error declining invitation:', error);
        return res.status(HttpStatus.InternalServerError).json({ error: ErrorMessages.InternalServerError });
    }
}
