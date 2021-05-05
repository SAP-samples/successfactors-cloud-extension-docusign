require('dotenv').config();
const { EOL } = require('os');

let sf_url = process.env.sf_url || 'https://apisalesdemo2.successfactors.eu'
if (sf_url.endsWith("/")) {
  sf_url = sf_url.substring(0, sf_url.length - 1)
}

let docu_sign_api_private_key = process.env.docu_sign_api_private_key
docu_sign_api_private_key = docu_sign_api_private_key.replace(/\\n/g, '\n')
docu_sign_api_private_key = docu_sign_api_private_key.replace(/-\s+/g, '-\n')
docu_sign_api_private_key = docu_sign_api_private_key.replace(/\s+-/g, '\n-')


let eventMeshMessaging = undefined
try {
  eventMeshMessaging = JSON.parse(process.env.em_messaging);
} catch (e) {}

let eventMeshEnabled = false;
let eventMeshOptions = {}
if (eventMeshMessaging !== undefined && eventMeshMessaging.length > 0) {
  eventMeshEnabled = true;

  let oa2 = undefined
  let uri = undefined
  for (const idx in eventMeshMessaging) {
    let msg = eventMeshMessaging[idx]
    if (!msg.protocol.includes("amqp10ws")) {
      continue;
    }
    oa2 = msg["oa2"]
    uri = new URL(msg["uri"])
  }

  eventMeshOptions = {
    wss: {
      host: uri.hostname,
      //port: uri.port,
      path: uri.pathname
    },
    oa2: {
      endpoint: oa2.tokenendpoint,
      client: oa2.clientid,
      secret: oa2.clientsecret,
    },
    sasl: {
      mechanism: 'ANONYMOUS',
      identity: ''
    },
    data: {
      source : `queue:${process.env.em_namespace}/${process.env.em_queue}`,
      maxCount : 100000,
      logCount : 1000
    },
    amqp: {
      outgoingSessionWindow: 1000,
      incomingSessionWindow: 1000,
      maxReceiverLinkCredit: 10,
      minReceiverLinkCredit: 5,
      maxMessageSize: 10000, // bytes
      idleTimeoutMilliseconds: 999999,
      idleTimeoutTryKeepAlive: true,
    },
    tune: {
      ostreamPayloadCopyLimit: 1024 // bytes
    },
    destinations: [],
  };
}


module.exports = Object.freeze({
  server: {
    port: process.env.PORT || 8080,
    baseUrl: "/"
  },
  logger: {
    level: process.env.log_level || 'debug',
  },

  docuSign: {
    baseUrl: process.env.docu_sign_base_url || 'https://demo.docusign.net/restapi',
    account_id: process.env.docu_sign_account_id,
    api: {
      url: process.env.docu_sign_ouath_base_url || 'account-d.docusign.com',
      scopes: process.env.docu_sign_ouath_scopes || 'signature impersonation',
      integration_key: process.env.docu_sign_api_integration_key,
      user_id: process.env.docu_sign_api_user_id,
      private_key: docu_sign_api_private_key,
      jwt_timeout: process.env.docu_sign_api_jwt_timeout || 5 * 60
    },
    signer: {
      email: process.env.docu_sign_signer_email,
      name: process.env.docu_sign_signer_name,
    },
    template_id: process.env.docu_sign_template_id || ''
  },
  successFactor: {
    apiUrl: `${sf_url}/odata/v2`,
    auth_url: `${sf_url}/ONB/api.ashx/authenticate`,
    hr_url: `${sf_url}/ONB/api.ashx/authenticate`,
    upload_url: `${sf_url}/ONB/api.ashx/doccenter/upload`,

    credentials: {
      username: process.env.sf_username,
      password: process.env.sf_password,
    },
  },

  eventMesh: {
    enabled: eventMeshEnabled,
    options: eventMeshOptions,
    name: process.env.em_name,
  }
});
