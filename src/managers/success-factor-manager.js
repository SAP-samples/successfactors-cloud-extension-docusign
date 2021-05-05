const string2fileStream = require('string-to-file-stream');
const FormData = require('form-data');
const logger = require('../logger/console')("SuccessFactorManager");
const { v4: uuidv4 } = require('uuid');


class SuccessFactorManager {
  constructor(successFactorClient) {
    this.successFactorClient = successFactorClient;
  }

  async getPersonIdExternalByFirstLastName(firstName, lastName) {
    const resp = await this.successFactorClient.getPerPersonal({
      filters : [`$filter=firstName%20eq%20%27${firstName}%27 and lastName%20eq%20%27${lastName}%27`],
    })
    let data = resp["d"]["results"]
    if (data instanceof Array) {
      if (data.length > 0) {
        data = data[0]
      }
    }
    return {
      personIdExternal: data["personIdExternal"],
    }
  }

  async getPersonPersonalInfo(personIdExternal) {
    const resp = await this.successFactorClient.getPerPerson({
      on: `('${personIdExternal}')`,
      filters : ["$expand=personalInfoNav"],
    })
    let data = resp["d"]["personalInfoNav"]["results"]
    if (data instanceof Array) {
      if (data.length > 0) {
        data = data[0]
      }
    }

    return {
      firstName: data["firstName"],
      lastName: data["lastName"],
      gender: data["gender"],
      nationality: data["nationality"],
    }
  }

  async getPersonEmail(personIdExternal) {
    const resp = await this.successFactorClient.getPerPerson({
      on: `('${personIdExternal}')/emailNav`,
      filters : [],
    })
    let data = resp["d"]["results"]
    if (data instanceof Array) {
      if (data.length > 0) {
        data = data[0]
      }
    }

    return {
      emailAddress: data["emailAddress"],
      isPrimary: data["isPrimary"],
    }
  }

  async getPersonJobInformation(personIdExternal) {
    const resp = await this.successFactorClient.getEmpEmployment({
      on: `(personIdExternal='${personIdExternal}',userId='${personIdExternal}')/jobInfoNav`,
      filters: [],
    })

    let data = resp["d"]["results"]
    if (data instanceof Array) {
      if (data.length > 0) {
        data = data[0]
      }
    }
    return {
      jobTitle: data["jobTitle"],
      timezone: data["timezone"],
      department: data["department"],
      company: data["company"],
    }
  }

  getOnboardingCandidateByKMSUserId(kmsUserId) {
    const resp = this.successFactorClient.getOnboardingCandidateInfo(
        {
          on: `$filter=kmsUserId%20eq%20%27${kmsUserId}%27`,
          filters: ["$expand=hrManagerIdNav"]
        })
    let data = resp["d"]["results"]
    if (data instanceof Array) {
      if (data.length > 0) {
        data = data[0]
      }
    }
    return {
      email: data["email"],
      hrManagerEmail: data["hrManagerIdNav"]["email"],
      hrManagerFullName: data["hrManagerIdNav"]["defaultFullName"],
    }
  }

  getOnboardingCandidateByEmail(email) {
    const resp = this.successFactorClient.getOnboardingCandidateInfo(
        {
          on: `$filter=email%20eq%20tolower('${email}')`,
          filters: [],
        })
    let data = resp["d"]["results"]
    if (data instanceof Array) {
      if (data.length > 0) {
        data = data[0]
      }
    }
    return {
      _responses: data,
      firstName: data["fName"],
      lastName: data["lName"],
      applicantId: data["applicantId"],
    }
  }


  getOnboardingCandidateByKMSUserId(kmsUserId) {
    const resp = this.successFactorClient.getOnboardingCandidateInfo(
        {
          on: `$filter=kmsUserId%20eq%20%27${kmsUserId}%27`,
          filters: ["$expand=hrManagerIdNav"]
        })
    let data = resp["d"]["results"]
    if (data instanceof Array) {
      if (data.length > 0) {
        data = data[0]
      }
    }
    return {
      email: data["email"],
      hrManagerEmail: data["hrManagerIdNav"]["email"],
      hrManagerFullName: data["hrManagerIdNav"]["defaultFullName"],
    }
  }

  async getHRDataByKMSUserId(kmsUserId) {
    return await this.successFactorClient.getHRData(`('${kmsUserId}')`)
  }


  async authenticationCookie() {
    return await this.successFactorClient.authenticationCookie();
  }

  async uploadDocument(firstName, lastName, applicantId, cookie, documentName, documentBinary) {
    const body = new FormData();
    const indexFile = `${documentName},dcDocumentName,Document Name,${documentName},Text\r\n${documentName},dcEmployeeID,Employee ID,${applicantId},Text\r\n${documentName},dcFirstName,First Name,${firstName},Text\r\n${documentName},dcLastName,Last Name,${lastName},Text`
    const indexFileStream = string2fileStream(indexFile, {})["input"]
    body.append(documentName, indexFileStream, { filename: documentName });
    body.append(documentName, new Buffer(documentBinary, 'binary'), { filename: documentName });

    const uuid = uuidv4();
    await this.successFactorClient.uploadBodyToDocumentCenter(cookie, body, `RequestId=${uuid}`, `FileCount=2`)
  }

}
module.exports = {
  factory(successFactorClient) {
    return new SuccessFactorManager(successFactorClient);
  },
};
