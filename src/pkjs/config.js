// Author: Ed Dam

module.exports = [
  {
    "type": "heading",
    "defaultValue": "Weather v1.0"
  },
  {
    "type": "text",
    "defaultValue": "by Edward Dam"
  },
  { "type": "section", "items": [
    { "type": "heading", "defaultValue": "Temperature" },
    { "type": "text", "defaultValue": "Please Choose Celsius or Fahrenheit" },
    { "type": "radiogroup", "messageKey": "temp_degrees", "options": [
      { "label": "Fahrenheit °F", "value": "fahrenheit" },
      { "label": "Celsius °C", "value": "celsius" } ],
    "defaultValue": "fahrenheit" } ]
  },
  {
    "type": "text",
    "defaultValue": "Powered by DarkSky.net"
  },
  {
    "type": "submit",
    "defaultValue": "Submit"
  }
];
