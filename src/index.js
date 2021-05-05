// const express = require('express');
// const { CloudEvent, HTTP } = require("cloudevents");
// const events = require("../events")
//
// const app = express();
//
// app.use((req, res, next) => {
//     let data = "";
//
//     req.setEncoding("utf8");
//     req.on("data", function (chunk) {
//         data += chunk;
//     });
//
//     req.on("end", function () {
//         req.body = data;
//         next();
//     });
// });
//
// app.get('/livez', (req, res) => {
//     res.sendStatus(200);
// });
// app.get('/readyz', (req, res) => {
//     res.sendStatus(200);
// });
// app.get('/healthz', (req, res) => {
//     res.sendStatus(200);
// });
//
// app.post("/", (req, res) => {
//     try {
//         const event = HTTP.toEvent({ headers: req.headers, body: req.body });
//         events.process(event)
//
//         // respond as an event
//         const responseEvent = new CloudEvent({
//             source: '/',
//             type: 'event:response',
//             ...event
//         });
//         res.status(201).json(responseEvent);
//     } catch (err) {
//         console.error(err);
//         res.status(415).header("Content-Type", "application/json").send(JSON.stringify(err));
//     }
// });
//
//
// const port = process.env.PORT || 8080;
// app.listen(port, () => {
//     console.log('C4C Events Consumer listening on port', port);
// });

const logger = require('./logger/console')("Main");
const {
    server: { port },
} = require('./constants/constants');

require('./bootstrap')
    .bootstrapApplication()
    .then(server => server.listen(port))
    .then(() => logger.info(`The application is up on port ${port}`));

