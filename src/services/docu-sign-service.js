const logger = require('../logger/console')("DocuSignService");
const convert = require('xml-js');

class DocuSignService {
  constructor(docuSignManager, successFactorManager) {
    this.docuSignManager = docuSignManager;
    this.successFactorManager = successFactorManager;
  }

  async processEventData(rawData) {
    const data = convert.xml2js(rawData,{ compact: true, spaces: 4 })

    const username = this.docuSignManager.getRecipients(data)[1].username
    const elements = username.split(' ')
    const firstName = elements[0]
    const lastName = elements[1]

    const applicant = await this.successFactorManager.getPersonIdExternalByFirstLastName(firstName, lastName);
    const cookie = await this.successFactorManager.authenticationCookie()
    await this.docuSignManager.processData(data, (documentName, documentBinary) => {

      logger.info("Document Received %s", documentName)

      // TODO: Here you receive a copy of document from Docusign

      // await this.successFactorManager.uploadDocument(
      //     firstName,
      //     lastName,
      //     applicant.personIdExternal,
      //     cookie,
      //     documentName, documentBinary
      // );
    });
  }
}
module.exports = {
  factory(docuSignManager, successFactorManager) {
    return new DocuSignService(docuSignManager, successFactorManager);
  },
};
