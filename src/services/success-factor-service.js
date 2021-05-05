const logger = require('../logger/console')("SuccessFactorService");
const convert = require('xml-js');

const { docuSign } = require("../constants/constants")

// Dummy response for SFSF that lead to success
const successSoapResponse = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
        <soapenv:Header/>
        <soapenv:Body/>
      </soapenv:Envelope>
      `

class SuccessFactorService {
  constructor(successFactorManager, docuSignManager) {
    this.successFactorManager = successFactorManager;
    this.docuSignManager = docuSignManager;
  }

  _extractValue(obj, ...names) {
      const _getValueByName = (obj, id) => {
          let foundObject = undefined
          if (obj instanceof Array) {
              if (obj.length > id) {
                  foundObject = obj[id]
              }
          } else if (obj instanceof Object) {
              Object.keys(obj).forEach(key => {
                  if (key.endsWith(id)) {
                      foundObject = obj[key]
                      return
                  }
              })
          }
          return foundObject
      };

      for (let name of names) {
          obj = _getValueByName(obj, name)
          if (obj === undefined) {
              return undefined
          }
      }
      return obj
  }

  async processEventData(rawData) {
      // Convert the event data from xml string to a javascript object
      const convertedData = convert.xml2js(rawData,{ compact: true, spaces: 4 })

      // Extract the value of perPersonExternal from requests data
      const perPersonExternal = this._extractValue(convertedData,
          "Envelope", "Body", "ExternalEvent", "events", "event", "params", "param", 0, "value", "_text"
      )
      if (perPersonExternal === undefined) {
          throw new Error("Couldn't find the perPersonExternal parameter value")
      }

      return await this.processByUserId(perPersonExternal)
  }

  async processByUserId(userId) {
    logger.info("Calling successFactorManager.getPersonPersonalInfo")
    const personalInfo = await this.successFactorManager.getPersonPersonalInfo(userId)

    logger.info("Calling successFactorManager.getPersonEmail")
    const emailInfo = await this.successFactorManager.getPersonEmail(userId)

    logger.info("Calling successFactorManager.getPersonJobInformation")
    const jobInfo = await this.successFactorManager.getPersonJobInformation(userId)

    const fullName = `${personalInfo["firstName"]} ${personalInfo["lastName"]}`

    logger.info("Calling docuSignManager.createTemplate for signerRecipient")
    const signerRecipient = this.docuSignManager.createTemplate({
        // email: emailInfo["emailAddress"], // TODO: For production this line should be un-commented
        email: docuSign.signer.email, // TODO: For production this line should be removed
        name: fullName,
        roleName: 'Employee',
        tabs: {
            textTabs: [
                { tabLabel: "FullName", value: fullName, locked: true},
                { tabLabel: "JobTitle", value: jobInfo["jobTitle"], locked: true},
            ],
            radioGroupTabs: [{
                // groupName: "Section1CitizenGroup",
                // radios: [
                // { value: "A citizen of the United States", selected: <boolean value> },
                // ]
            }]
        }
    });

    logger.info("Calling docuSignManager.createTemplate for ccRecipient")
    const ccRecipient = this.docuSignManager.createTemplate({
        email: docuSign.signer.email, // TODO: For production use the email of a line manager coming from Success Factors
        name: docuSign.signer.name, // TODO: For production use the name of  a line manager coming from Success Factors
        roleName: 'CC'
    });


    // Create Envelope
    logger.info("Calling docuSignManager.createEnvelop")
    await this.docuSignManager.createEnvelop(docuSign.template_id, [signerRecipient, ccRecipient], "sent");

    logger.info("Done Success")
    // Dummy SOAP response for SFSF
    return successSoapResponse;
  }
}
module.exports = {
  factory(successFactorManager, docuSignManager) {
    return new SuccessFactorService(successFactorManager, docuSignManager);
  },
};
