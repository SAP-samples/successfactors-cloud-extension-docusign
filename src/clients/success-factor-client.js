const fetch = require('node-fetch');
const axios = require('axios');

const logger = require("../logger/console")("SuccessFactorClient")
const { successFactor: sf } = require("../constants/constants")
const ContainerError = require("../errors/container-error")

const jsonFilter = "$format=JSON"

class SuccessFactorClient {

  _structureFilters(...filters) {
    let filter = this._joinFilters(filters)
    if (filter.indexOf(jsonFilter) < 0) {
      if (filter.length > 0) {
        return `${jsonFilter}&${filter}`
      } else {
        return jsonFilter
      }
    }
    return filter
  }

  _joinFilters(...filters) {
    let filter = ""
    if (filters.length > 0) {
      filter = filters.join("&")
    }
    return filter
  }

  _structureElement(element) {
    if (element !== undefined && element.length > 0 && !element.startsWith("/")) {
      return `/${element}`
    }
    return ""
  }

  getPerPerson({on = "", filters = []}) {
    const filter = this._structureFilters(filters)
    return this._get(`${sf.apiUrl}/PerPerson${on}?${filter}`)
  }

  async getEmpEmployment({on = "", filters = []}) {
    const filter = this._structureFilters(filters)
    return this._get(`${sf.apiUrl}/EmpEmployment${on}?${filter}`)
  }

  async getPerPersonal({on = "", filters = []}) {
    const filter = this._structureFilters(filters)
    return this._get(`${sf.apiUrl}/PerPersonal${on}?${filter}`)
  }

  _get(url) {
    return axios({
      url: url,
      headers: {
        'Authorization': `Basic ${Buffer.from(sf.credentials.username + ":" + sf.credentials.password).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      method: 'get',
    }).then(response => {
      const err = response["error"]
      if (err) {
        logger.error("On Calling %s")
        throw new ContainerError(err.message.value, err);
      }
      return response["data"];
    })
  }
  getOnboardingCandidateInfo({on = "", filters = []}) {
    const filter = this._structureFilters(filters)
    return this._get(`${sf.apiUrl}/OnboardingCandidateInfo${on}?${filter}`)
  }

  authenticationCookie() {
    const _parseCookies = (cookies) => {
      return cookies.map((entry) => {
        const parts = entry.split(';');
        const cookiePart = parts[0];
        return cookiePart;
      }).join(';');
    }
    return axios({
      url: sf.auth_url,
      method: 'post',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
        .then((resp) => _parseCookies(resp.headers['set-cookie']))
        .catch((err) => _parseCookies(err.response.headers['set-cookie']))
  }

  async getHRData(...filters) {
    const cookie = await this.authenticationCookie()
    const filter = this._structureFilters(filters)
    return axios({
      url: sf.hr_url + filter,
      method: 'get',
      headers: { Cookie: cookie },
    }).then((resp) => resp)
  }

  async uploadBodyToDocumentCenter(cookie, body, ...filters) {
    let filter = this._joinFilters(filters)
    if (filter.length > 0) {
      filter = `?${filter}`
    }

    return axios({
      url: sf.upload_url + filter,
      method: 'post',
      headers: { Cookie: cookie },
      data: body,
    }).then(response => {
      return response
    }).then(data => {
      const err = data["error"]
      if (err) {
        throw new ContainerError(err.message.value, err);
      }
      return data["d"]["results"];
    })
  }
}

module.exports = {
  factory: () => new SuccessFactorClient(),
};
