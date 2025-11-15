import { WebhookEvent } from '@clerk/express';
import express from 'express';
import { Webhook } from 'svix';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
const router = express.Router();

router.post('/webhooks/register', async (req, res) => {

    try {
        logger.info('processing webhook registration');

        logger.info('starting to process webhook headers');
        const headers = req.headers;
        const svix_id = headers['svix-id'];
        const svix_timestamp = headers['svix-timestamp'];
        const svix_signature = headers['svix-signature'];

        if (!svix_id || !svix_timestamp || !svix_signature) {
            logger.error('Missing required Svix headers');
            res.status(400).send('Bad Request: Missing required headers');
            return;
        }

        logger.info(`Webhook Headers: ${svix_id}, ${svix_timestamp}, ${svix_signature}`);

        const payload = req.body;
        logger.info(`Webhook Payload: ${JSON.stringify(payload)}`);
        const body = JSON.stringify(payload);

        const webhookSecret = process.env.SVIX_WEBHOOK_SECRET || '';
        logger.info(`Using webhook secret: ${webhookSecret}`);
        const wh = new Webhook(webhookSecret);

        let evt: WebhookEvent;
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id as string,
                "svix-timestamp": svix_timestamp as string,
                "svix-signature": svix_signature as string,
            }) as WebhookEvent;
            logger.info(`Webhook verified successfully: ${JSON.stringify(evt)}`);
        } catch (error) {
            logger.error(`Error verifying webhook: ${error}`);
            res.status(400).send('Bad Request: Invalid signature');
            return;
        }

        // Handle the event

        const eventType = evt.type;
        if (eventType === 'user.created') {
            const { id, first_name, last_name, email_addresses } = evt.data;
            logger.info(`New user created: ${JSON.stringify({ id, first_name, last_name, email_addresses })}`);

            const name = `${first_name} ${last_name}`;
            const fullName = name.trim();
            const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : '';

            await prisma.user.create({
                data: {
                    id: id,
                    email: email,
                    name: fullName,
                }
            });
            logger.info(`User ${fullName} with email ${email} created in the database.`);
        }

        logger.info('Webhook processing completed successfully.');
        res.status(200).send('Event received');

    } catch (error) {
        logger.error(`Error processing webhook registration: ${error}`);
        res.status(500).send('Internal Server Error');
    }
})

export default router;