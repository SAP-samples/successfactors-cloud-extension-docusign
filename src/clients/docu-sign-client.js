const docusign = require('docusign-esign');

const logger = require("../logger/console")("DocuSignClient")
const { docuSign } = require("../constants/constants")
const ContainerError = require("../errors/container-error")

class DocuSignClient {

  async createApiClient(){
    const dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(docuSign.baseUrl);
    dsApiClient.setOAuthBasePath(docuSign.api.url);

    const accessToken = await dsApiClient.requestJWTUserToken(
        docuSign.api.integration_key,
        docuSign.api.user_id,
        docuSign.api.scopes,
        docuSign.api.private_key,
        docuSign.api.jwt_timeout
    ).then((response) => {
      return response.body.access_token
    }).catch((err) => {
      throw new ContainerError("Failed to request a Docu Sign JWT Token;" + err.message, err)
    })
    dsApiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    return dsApiClient
  }

}

module.exports = {
  factory: () => new DocuSignClient(),
};
