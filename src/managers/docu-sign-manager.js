const docuESign = require('docusign-esign');

const logger = require('../logger/console')("DocuSignManager");
const { docuSign } = require("../constants/constants")
const ContainerError = require("../errors/container-error")

class DocuSignManager {
  constructor(docuSignClient) {
    this.docuSignClient = docuSignClient;
  }

  getRecipients(data) {
    if (data.DocuSignEnvelopeInformation.EnvelopeStatus.RecipientStatuses.RecipientStatus instanceof Array) {
      return data.DocuSignEnvelopeInformation.EnvelopeStatus.RecipientStatuses.RecipientStatus.map(r => {
        return { email: r.Email._text, username: r.UserName._text, order: r.RoutingOrder._text }
      });
    }
    else {
      let recipientStatus = data.DocuSignEnvelopeInformation.EnvelopeStatus.RecipientStatuses.RecipientStatus;
      return [{ email: recipientStatus.Email._text, username: recipientStatus.UserName._text, order: recipientStatus.RoutingOrder._text }]
    }
  }

  async processData(data, callback) {

    const envelopeId = data.DocuSignEnvelopeInformation.EnvelopeStatus.EnvelopeID._text;
    const docuSignAccountId = docuSign.account_id

    // Get all document names from the request
    const documents = this._extractEnvelopDocuments(data)

    const client = await this.docuSignClient.createApiClient();
    const envelopesApi = new docuESign.EnvelopesApi(client);
    documents.map ((doc) => {
      this._getDocument(envelopesApi, docuSignAccountId, envelopeId, doc.id, doc.name, callback)
    })
  }

  async _getDocument(envelopesApi, docuSignAccountId, envelopeId, documentId, documentName, callback) {
    await envelopesApi.getDocument(docuSignAccountId, envelopeId, documentId).then((response) => {
      callback(documentName, response)
    }).catch((err) => {
      throw new ContainerError("Can't get the docu sign document.;" + err.message, err)
    });
  }

  _extractEnvelopDocuments(data) {
    if (data.DocuSignEnvelopeInformation.EnvelopeStatus.DocumentStatuses.DocumentStatus instanceof Array) {
      return data.DocuSignEnvelopeInformation.EnvelopeStatus.DocumentStatuses.DocumentStatus.map(s => ({ "id": s.ID._text, "name": s.Name._text }));
    } else {
      let documentStatus = data.DocuSignEnvelopeInformation.EnvelopeStatus.DocumentStatuses.DocumentStatus;
      return [{ name: documentStatus.Name._text, id: documentStatus.ID._text }]
    }
  }

  async createEnvelop(templateId, templateRoles, status) {
    const env = new docuESign.EnvelopeDefinition();
    env.templateId = templateId;
    env.templateRoles = templateRoles;
    env.status = status; // status has to be set to sent that it will be send after pushing it to DocuSign

    const client = await this.docuSignClient.createApiClient()
    const envelopesApi = new docuESign.EnvelopesApi(client);
    await envelopesApi.createEnvelope(docuSign.account_id, { envelopeDefinition: env })
        .then((response) => {
          return response.body
        }).catch((err) => {
          throw new ContainerError("Failed to create a Docu Sign envelop;" + err.message, err)
        })
  }

  createTemplate(data) {
    return docuESign.TemplateRole.constructFromObject(data);
  }

}
module.exports = {
  factory(docuSignClient) {
    return new DocuSignManager(docuSignClient);
  },
};
