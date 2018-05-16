const fs = require('fs')
const path = require('path')

const arch = require('arch')
const crypto = require('crypto')

const FISSION_SETTINGS_FILE_NAME = 'fission.json'

class FissionSettingsFile {
    constructor(basePath) {
        this.basePath = basePath
        this.settingsFilePath = path.join(basePath, FISSION_SETTINGS_FILE_NAME)
        if (!fs.existsSync(this.settingsFilePath)) {
            fs.writeFileSync(this.settingsFilePath, JSON.stringify({}))
        }
    }

    getFileData() {
        return JSON.parse(fs.readFileSync(this.settingsFilePath))
    }

    get(key) {
        return this.getFileData()[key]
    }

    set(key, val) {
        let data = this.getFileData()
        data[key] = val
        fs.writeFileSync(this.settingsFilePath, JSON.stringify(data))
    }
}

function getUid(app) {
    const settings = new FissionSettingsFile(app.getPath('userData'))
    let id = settings.get('uid')
    if (!id) {
        id = crypto.randomBytes(32).toString('hex'),  // 256-bit random ID
        settings.set('uid', id)
    }
    return id
}

function paramsToURLQuery (params) {
    let data = Object.entries(params);
    data = data.map(([k, v]) => {
        return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    })
    return  data.join('&');
}

function getUpdateRequestParams(app) {
    let params = {
        version: app.getVersion(),
        projectKey: '123',
        platform: process.platform,
        sysarch: arch() === 'x64' ? 'x64' : 'ia32',
        uid: getUid(app),
        channel: null
    }
    console.log('params are', paramsToURLQuery(params))
    return paramsToURLQuery(params)
}

module.exports = {
    getUpdateRequestParams
}
