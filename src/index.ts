import * as fs from 'fs'
import * as https from 'https'

let Service: any
let Characteristic: any
let CurrentTemperature: any

export default (homebridge: any): void => {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  CurrentTemperature = Characteristic.CurrentTemperature

  homebridge.registerAccessory(
    'homebridge-weather',
    'Weather',
    WeatherAccessory
  )
}

const readFile = (filePath: string, callback: Function): void => {
  function parseData(data: string) {
    const readings: Reading[] = JSON.parse(data)
    if (readings.length == 0) {
      return callback(null, null)
    }
    const hourly = filterReadings(readings)
    return callback(null, hourly)
  }

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    https.get(filePath, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        return parseData(data);
      });

    }).on("error", (err) => {
      return callback(err)
    });

    return;
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return callback(err)
    }

    return parseData(data);
  })
}

const filterReadings = (readings: Reading[]): Reading[] => {
  if (readings.length < 2) {
    return readings;
  }

  const now = new Date().getTime()
  return readings.filter(reading => {
    const time = Date.parse(reading.time)
    return now - time < 3600000
  })
}

class WeatherAccessory {
  // configuration
  log: Function
  name: string = ''
  filePath?: string

  temperatureSensor: any
  humiditySensor: any

  constructor(log: Function, config: Record<string, string | number[]>) {
    this.log = log
    if (typeof config.name === 'string') {
      this.name = config['name']
    }
    if (typeof config.file_path === 'string') {
      this.filePath = config['file_path']
    }
    const name = 'Weather';

    this.temperatureSensor = new Service.TemperatureSensor(name+' Temperature')
    this.humiditySensor = new Service.HumiditySensor(name+' Humidity')
  }

  update(callback: Function): void {
    if (typeof this.filePath === 'undefined') {
      return this.temperatureSensor.setCharacteristic(Characteristic.StatusFault, 1)
    }
    readFile(
      this.filePath,
      (err: NodeJS.ErrnoException, data: Reading[]): void => {
        if (err || data === null) {
          this.temperatureSensor.setCharacteristic(Characteristic.StatusFault, 1)
          callback(err)
          return
        }

        const latest = data[data.length - 1]
        const temperature = parseFloat(latest.temperature)
        const humidity = parseFloat(latest.humidity)

        this.temperatureSensor.setCharacteristic(Characteristic.CurrentTemperature, temperature)
        this.humiditySensor.setCharacteristic(Characteristic.CurrentRelativeHumidity, humidity)

        callback(null, true)
      }
    )
  }

  getServices() {
    this.temperatureSensor
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this.update.bind(this))
    ;

    this.humiditySensor
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', this.update.bind(this))
    ;

    return [this.temperatureSensor, this.humiditySensor]
  }
}

export { WeatherAccessory, filterReadings }
