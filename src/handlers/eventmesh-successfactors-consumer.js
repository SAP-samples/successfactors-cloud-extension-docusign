'use strict';
const logger = require('../logger/console')("EventMesh Receiver SuccessFactors");

const AMQP = require('@sap/xb-msg-amqp-v100');
const { eventMesh } = require("../constants/constants")

const factory = (successFactorService) => {
    if (!eventMesh.enabled) {
        return
    }

    logger.info("Create Consumer from EventMesh using options:", eventMesh.options)

    const client = new AMQP.Client(eventMesh.options);
    const stream = client.receiver(eventMesh.name).attach(eventMesh.options.data.source);

    stream
        .on('ready', () => {
            logger.info('ready');
        })
        .on('data', async (message) => {
            const chunks = message.payload.chunks
            for (const idx in chunks) {
                const body = chunks[idx].toString()
                logger.info("Event Mesh Received an request from SF: %s", body)
                try {
                    const event = JSON.parse(body)
                    if (event.userId) {
                        await successFactorService.processByUserId(event.userId)
                    } else {
                        logger.error("Event Mesh Failed to Process SuccessFactors Event; User Id wasn't identified into event");
                    }
                } catch (err) {
                    logger.error("Event Mesh Failed to Process SuccessFactors Event: %s", err);
                }
            }
        })
        .on('finish', () => {
            logger.info('finish');

            client.disconnect();
        });

    client
        .on('connected',(destination, peerInfo) => {
            logger.info('connected ', peerInfo.description);
        })
        .on('assert', (error) => {
            logger.error(error.message.chunk);
        })
        .on('error', (error) => {
            logger.error(error);
        })
        .on('reconnecting', (destination) => {
            logger.info('reconnecting, using destination ', destination);
        })
        .on('disconnected', (hadError, byBroker, statistics) => {
            logger.info('disconnected', statistics);
            client.connect();
        });

    client.connect();
};

module.exports = factory
