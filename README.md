# homebridge-weather
This is a plugin for [Homebridge](https://github.com/nfarina/homebridge) which shows up temperature/humidity sensor.

## File format
The plugin expects to get a list of readings in JSON form:
```
[
  {"temperature": 13, "humidity": 50, "time": "12.03.2020 21:23:32"},
  {"temperature": 12, "humidity": 55, "time": "12.03.2020 22:23:32"},
]
```

## Installation and configuration
Run `npm install homebridge-weather`

Add an acceessory configuration into your Homebridge config.json:
```
{
  "accessory": "Weather",
  "name": "Weather",
  "description": "Weather sensors",
  "file_path": "/home/pi/weather/weather.json"
}
```

Point the `file_path` to a file or url containing the readings.
